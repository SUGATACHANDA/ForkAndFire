const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel.js");
const mongoose = require("mongoose");

// @desc    Get all orders for the currently logged-in user
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    // Find orders where the 'user' field matches the ID of the logged-in user
    const orders = await Order.find({ user: req.user._id })
        .populate("product", "name imageUrl") // Populate the product details
        .sort({ createdAt: -1 }); // Show newest orders first

    res.status(200).json(orders);
});

// @desc    Get all orders (for admin)
// @route   GET /api/orders/all-orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
    // Check for a limit query parameter for dashboard widgets
    const limit = parseInt(req.query.limit, 10) || 0;
    const offset = parseInt(req.query.offset, 10) || 0;

    try {
        // Run two queries concurrently: one to get the paginated data, one for the total count
        const [orders, totalOrders] = await Promise.all([
            Order.find({})
                .populate("user", "name email")
                .populate("product", "name")
                .sort({ purchasedAt: -1 })
                .limit(limit)
                .skip(offset),
            Order.countDocuments({}),
        ]);

        // Send back the orders and the total count
        res.json({
            orders,
            total: totalOrders,
        });
    } catch (error) {
        res.status(500);
        throw new Error("Server error while fetching orders.");
    }
});

const verifyOrderToken = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        res.status(400);
        throw new Error("No confirmation token provided.");
    }

    // Find the order by its access token and user ownership
    const order = await Order.findOne({
        access_token: token,
        user: req.user._id,
    }).populate("product", "name imageUrl");

    if (!order) {
        res.status(404);
        throw new Error(
            "This confirmation link is invalid or has already been used."
        );
    }

    // Invalidate the token to make it single-use
    order.access_token = null;
    order.is_confirmation_viewed = true;
    await order.save();

    res.json(order);
});

const getOrderByTransactionId = asyncHandler(async (req, res) => {
    const order = await Order.findOne({
        paddleTransactionId: req.params.transactionId,
        user: req.user._id,
    });
    if (!order) {
        res.status(404);
        throw new Error("Order not found yet.");
    }
    res.json(order);
});

// We can add more admin functions here later if needed, like updating order status.

module.exports = {
    getMyOrders,
    getAllOrders,
    verifyOrderToken,
    getOrderByTransactionId,
};
