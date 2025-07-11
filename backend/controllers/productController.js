const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel.js');
const { paddleApi } = require('../utils/paddleClient.js');

// === PUBLIC-FACING CONTROLLERS ===

/** @desc Get all active products */
const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ amountLeft: { $gt: 0 } }).sort({ createdAt: -1 });
    res.json(products);
});

/** @desc Get a single product by its MongoDB ID */
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) res.json(product);
    else { res.status(404); throw new Error('Product not found'); }
});

/** @desc Create a Paddle Transaction for Inline Checkout */
const createTransactionForCheckout = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const { id: productId } = req.params;
    const user = req.user;

    const product = await Product.findById(productId);
    if (!product || !product.paddlePriceId) throw new Error('Product not found or not configured.');
    if (quantity > product.amountLeft) throw new Error(`Only ${product.amountLeft} items are in stock.`);

    try {
        const response = await paddleApi.post('/transactions', {
            items: [{ price_id: product.paddlePriceId, quantity: parseInt(quantity) || 1 }],
            customer: { email: user.email },
            custom_data: { userId: user._id.toString(), productId: product._id.toString(), quantity: parseInt(quantity) || 1 }
        });
        const transactionId = response.data?.data?.id;
        if (!transactionId) throw new Error("Could not initialize payment session.");

        res.status(200).json({ transactionId });
    } catch (err) {
        console.error("❌ PADDLE TRANSACTION ERROR:", err.response?.data);
        throw new Error(err.response?.data?.error?.detail || "Payment provider error.");
    }
});


// === ADMIN-ONLY CONTROLLERS ===

/** @desc Create a new product on Paddle and locally */
const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, currency = 'USD', imageUrl, totalAmount } = req.body;
    if (!name || !price || !totalAmount) throw new Error('Name, price, and total stock are required.');

    // Step 1: Create Product on Paddle
    const paddleProductPayload = { name, description, tax_category: 'standard' };
    const productResponse = await paddleApi.post('/products', paddleProductPayload);
    const paddleProduct = productResponse.data.data;

    // Step 2: Create a Price for the Product on Paddle
    const pricePayload = {
        product_id: paddleProduct.id,
        description: `Standard price for ${name}`,
        unit_price: { amount: String(Math.round(parseFloat(price) * 100)), currency_code: currency },
        billing_cycle: null
    };
    const priceResponse = await paddleApi.post('/prices', pricePayload);
    const paddlePrice = priceResponse.data.data;

    // Step 3: Save to local DB
    const newProduct = new Product({
        name, description, imageUrl, price, currency, totalAmount,
        amountLeft: totalAmount,
        paddleProductId: paddleProduct.id,
        paddlePriceId: paddlePrice.id
    });
    const createdProduct = await newProduct.save();
    res.status(201).json(createdProduct);
});

/** @desc Update a product locally and sync changes with Paddle */
const updateProduct = asyncHandler(async (req, res) => {
    const { name, description, imageUrl, price, totalAmount, amountLeft, currency } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) { res.status(404); throw new Error('Product not found.'); }

    // --- Sync Product Details (Name, Description) ---
    const paddleProductUpdate = {};
    if (name && name !== product.name) paddleProductUpdate.name = name;
    if (description && description !== product.description) paddleProductUpdate.description = description;

    if (Object.keys(paddleProductUpdate).length > 0) {
        await paddleApi.patch(`/products/${product.paddleProductId}`, paddleProductUpdate);
    }

    // --- Sync Price (only if it has changed) ---
    const newPrice = parseFloat(price);
    let finalPaddlePriceId = product.paddlePriceId;

    if (newPrice && newPrice !== product.price) {
        // Price has changed. We must archive the old one and create a new one.
        // 1. Archive old price (best effort, don't fail if it's already inactive)
        await paddleApi.patch(`/prices/${product.paddlePriceId}`, { status: 'archived' }).catch(e => console.warn(`Could not archive old price ${product.paddlePriceId}`));

        // 2. Create new price
        const newPricePayload = {
            product_id: product.paddleProductId,
            description: `Updated price for ${name || product.name}`,
            unit_price: { amount: String(Math.round(newPrice * 100)), currency_code: currency || product.currency },
            billing_cycle: null,
        };
        const priceResponse = await paddleApi.post('/prices', newPricePayload);
        finalPaddlePriceId = priceResponse.data.data.id;
    }

    // --- Update Local DB with all changes ---
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.imageUrl = imageUrl ?? product.imageUrl;
    product.price = newPrice ?? product.price;
    product.totalAmount = totalAmount ?? product.totalAmount;
    product.amountLeft = amountLeft ?? product.amountLeft;
    product.paddlePriceId = finalPaddlePriceId; // Use the new or existing price ID

    if (product.amountLeft > product.totalAmount) throw new Error('"Stock Left" cannot exceed "Total Stock".');

    const updatedProduct = await product.save();
    res.json(updatedProduct);
});

/** @desc Delete a product locally and archive it on Paddle */
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        // Archive on Paddle first to prevent new purchases
        await paddleApi.patch(`/products/${product.paddleProductId}`, { status: 'archived' });
        // Then delete locally
        await product.deleteOne();
        res.json({ message: 'Product archived on Paddle and removed from database.' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

const getAllProductsAdmin = asyncHandler(async (req, res) => {
    // This query has NO filter for amountLeft, so it returns everything.
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
});


module.exports = {
    getAllProducts,
    getProductById,
    createTransactionForCheckout,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProductsAdmin
};