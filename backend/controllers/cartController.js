const asyncHandler = require('express-async-handler');
const User = require('../models/userModel.js');

// @desc    Get user's shopping cart
// @route   GET /api/cart
const getCart = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('cart.product');
    res.json(user.cart);
});

// @desc    Add item to cart or update quantity
// @route   POST /api/cart
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const user = await User.findById(req.user._id);

    const existingItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

    if (existingItemIndex > -1) {
        // If item exists, update its quantity
        user.cart[existingItemIndex].quantity += quantity;
    } else {
        // If item doesn't exist, add it to the cart
        user.cart.push({ product: productId, quantity });
    }

    await user.save();
    const populatedUser = await User.findById(req.user._id).populate('cart.product');
    res.status(200).json(populatedUser.cart);
});


// @desc    Remove an item from the cart
// @route   DELETE /api/cart/:productId
const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(item => item.product.toString() !== productId);

    await user.save();
    const populatedUser = await User.findById(req.user._id).populate('cart.product');
    res.status(200).json(populatedUser.cart);
});

// @desc    Clear the entire cart (e.g., after successful purchase)
// @route   DELETE /api/cart/
const clearCart = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    res.status(200).json([]);
});

module.exports = { getCart, addToCart, removeFromCart, clearCart };