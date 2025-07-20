const axios = require('axios');
const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const { CartOrder } = require("../models/orderModel");
const { paddleApi } = require("../utils/paddleClient.js");

const PADDLE_API_URL = 'https://sandbox-api.paddle.com/transactions'; // Paddle v2 API endpoint
const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;

const handleCartCheckout = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const email = req.user.email;
    const userCountry = req.user.country || 'US';

    // Step 1: Fetch cart with products populated
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
        res.status(400);
        throw new Error('Cart is empty.');
    }

    const paddleItems = [];
    const cartData = [];

    // Step 2: Validate stock & prepare payloads
    for (const item of cart.items) {
        const product = item.product;

        if (!product || !item.paddlePriceId) continue;

        if (item.quantity > product.amountLeft) {
            res.status(400);
            throw new Error(`Insufficient stock for ${product.name}`);
        }

        const localizedPriceObj = product.productsPaddlePrice?.find(
            p => p.country.toLowerCase() === userCountry.toLowerCase()
        );

        const paddlePriceId = localizedPriceObj?.paddlePriceId || item.paddlePriceId;
        if (!paddlePriceId) {
            res.status(400);
            throw new Error(`No Paddle price found for ${product.name} in ${userCountry}`);
        }

        paddleItems.push({
            price_id: item.paddlePriceId,
            quantity: item.quantity
        });

        cartData.push({
            productId: product._id,
            quantity: item.quantity,
            paddlePriceId: item.paddlePriceId
        });
    }

    // Step 3: Build Paddle transaction payload
    const payload = {
        items: paddleItems,
        customer: {
            email
        },
        custom_data: {
            userId: userId.toString(),
            cart: cartData
        },
        custom_checkout: {
            enable: true,
            redirect_url: `${process.env.FRONTEND_URL}/purchase-success`
        }
    };

    // Step 4: Send transaction to Paddle
    try {
        console.log('➡️ Sending to Paddle /transactions:', JSON.stringify(payload, null, 2));

        const response = await axios.post(
            'https://sandbox-api.paddle.com/transactions',
            payload,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const transaction = response.data?.data;

        console.log(transaction)

        if (!transaction || !transaction.id || !transaction.checkout?.url) {
            console.error('❌ Invalid Paddle transaction:', response.data);
            res.status(500);
            throw new Error('Failed to create checkout transaction');
        }

        const { id: transactionId, checkout } = transaction;

        // Step 5: Update product stock
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);
            if (product) {
                product.amountLeft -= item.quantity;
                await product.save();
            }
        }

        // Step 6: Update user's purchased products
        const user = await User.findById(userId);
        if (user) {
            for (const item of cart.items) {
                const productId = item.product._id.toString();
                if (!user.purchasedProducts.includes(productId)) {
                    user.purchasedProducts.push(productId);
                }
            }
            await user.save();
        }

        // ✅ Step 7: Save cart order to CartOrder model
        const totals = transaction.details?.totals;
        const currencyCode = totals?.currencyCode || 'USD';
        const displayPrice = totals?.total || '0.00'; // e.g., "$111.96"
        const grandTotalCents = totals?.grandTotal ?? 0;
        const grandTotal = grandTotalCents / 100;

        const cartOrder = new CartOrder({
            user: userId,
            items: cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity
            })),
            paddleTransactionId: transactionId,
            currency: currencyCode,
            displayPrice: displayPrice,
            purchasePrice: grandTotal,
            status: 'completed',
            purchasedAt: new Date(transaction.billed_at || Date.now())
        });

        await cartOrder.save();

        // Step 8: Clear user's cart
        await Cart.deleteOne({ user: userId });

        // Step 9: Return transaction info
        res.status(200).json({
            transactionId,
            checkoutUrl: checkout.url
        });

    } catch (error) {
        console.error('❌ Paddle transaction error:', error.response?.data || error.message);
        res.status(500);
        throw new Error('Checkout failed. Please try again.');
    }
});

const createTransactionForCart = asyncHandler(async (req, res) => {
    const user = req.user;

    // Fetch cart for this user
    const cart = await Cart.findOne({ user: user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty.' });
    }

    // Construct paddle items array
    const paddleItems = [];
    for (const item of cart.items) {
        const product = item.product;
        const quantity = item.quantity;

        if (!product || !product.paddlePriceId) {
            return res.status(400).json({ message: `Product ${product?.name || ''} is not configured for checkout.` });
        }

        if (quantity > product.amountLeft) {
            return res.status(400).json({ message: `Only ${product.amountLeft} items left for ${product.name}` });
        }

        paddleItems.push({
            price_id: product.paddlePriceId,
            quantity: quantity
        });
    }

    // Create Paddle transaction
    try {
        const response = await paddleApi.post('/transactions', {
            items: paddleItems,
            customer: {
                email: user.email
            },
            custom_data: {
                userId: user._id.toString(),
                cart: cart.items.map(item => ({
                    productId: item.product._id.toString(),
                    quantity: item.quantity
                }))
            }
        });

        const transactionId = response.data?.data?.id;
        console.log("Paddle response:", response.data);
        const checkoutUrl = response?.data?.data?.checkout?.url;
        if (!transactionId) throw new Error("Could not initialize payment session.");

        res.status(200).json({ transactionId, checkoutUrl });
    } catch (err) {
        console.error("❌ PADDLE TRANSACTION ERROR:", err);
        throw new Error(err.response?.data?.error?.detail || "Payment provider error.");
    }
});




const saveToCart = async (req, res) => {
    const { productId, quantity, paddlePriceId } = req.body;
    const userId = req.user._id;

    if (!productId || !quantity || !paddlePriceId) {
        return res.status(400).json({ message: "Product ID, quantity, and paddlePriceId are required" });
    }

    // Fetch product to get available stock
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (quantity > product.amountLeft) {
        return res.status(400).json({
            message: `Only ${product.amountLeft} item(s) left in stock. Cannot add ${quantity}.`
        });
    }

    // Find or create cart for the user
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = new Cart({
            user: userId,
            items: [{ product: productId, quantity, paddlePriceId }]
        });
    } else {
        const existingItem = cart.items.find(item => item.product.toString() === productId);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            if (newQuantity > product.amountLeft) {
                return res.status(400).json({
                    message: `Only ${product.amountLeft} item(s) available. You already have ${existingItem.quantity} in cart.`
                });
            }

            existingItem.quantity = newQuantity;
        } else {
            cart.items.push({ product: productId, quantity, paddlePriceId });
        }
    }

    await cart.save();
    res.status(200).json({ message: 'Item added to cart', cart });
};

const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
        return res.status(200).json({ cart: [] });
    }

    res.status(200).json({ cart: cart.items });
});

const deleteFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    res.json({ message: "Item removed", cart });
});

const updateCartItem = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    if (!productId || quantity < 1) {
        return res.status(400).json({ message: 'Invalid update parameters' });
    }

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (quantity > product.amountLeft) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        const cartItem = await Cart.findOneAndUpdate(
            { user: userId, 'items.product': productId },
            {
                $set: {
                    'items.$.quantity': quantity,
                },
            },
            { new: true }
        );

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.status(200).json({ message: 'Cart updated', cart: cartItem });
    } catch (err) {
        console.error('Cart Update Error:', err);
        res.status(500).json({ message: 'Failed to update cart item' });
    }
};

module.exports = { saveToCart, getCart, deleteFromCart, updateCartItem, createTransactionForCart, handleCartCheckout };