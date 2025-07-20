// const asyncHandler = require("express-async-handler");
// const Order = require("../models/orderModel.js");
// const mongoose = require("mongoose");

// // @desc    Get all orders for the currently logged-in user
// // @route   GET /api/orders/my-orders
// // @access  Private
// const getMyOrders = asyncHandler(async (req, res) => {
//     // Find orders where the 'user' field matches the ID of the logged-in user
//     const orders = await Order.find({ user: req.user._id })
//         .populate("product", "name imageUrl") // Populate the product details
//         .sort({ createdAt: -1 }); // Show newest orders first

//     res.status(200).json(orders);
// });

// // @desc    Get all orders (for admin)
// // @route   GET /api/orders/all-orders
// // @access  Private/Admin
// const getAllOrders = asyncHandler(async (req, res) => {
//     // Check for a limit query parameter for dashboard widgets
//     const limit = parseInt(req.query.limit, 10) || 0;
//     const offset = parseInt(req.query.offset, 10) || 0;

//     try {
//         // Run two queries concurrently: one to get the paginated data, one for the total count
//         const [orders, totalOrders] = await Promise.all([
//             Order.find({})
//                 .populate("user", "name email")
//                 .populate("product", "name")
//                 .sort({ purchasedAt: -1 })
//                 .limit(limit)
//                 .skip(offset),
//             Order.countDocuments({}),
//         ]);

//         // Send back the orders and the total count
//         res.json({
//             orders,
//             total: totalOrders,
//         });
//     } catch (error) {
//         res.status(500);
//         throw new Error("Server error while fetching orders.");
//     }
// });

// // const verifyOrderToken = asyncHandler(async (req, res) => {
// //     const { token } = req.body;
// //     if (!token) {
// //         res.status(400);
// //         throw new Error("No confirmation token provided.");
// //     }

// //     // Find the order by its access token and user ownership
// //     const order = await Order.findOne({
// //         user: req.user._id,
// //     }).populate("product", "name imageUrl");

// //     if (!order) {
// //         res.status(404);
// //         throw new Error(
// //             "This confirmation link is invalid or has already been used."
// //         );
// //     }

// //     // Invalidate the token to make it single-use
// //     order.is_confirmation_viewed = true;
// //     await order.save();

// //     res.json(order);
// // });

// const getOrderByTransactionId = asyncHandler(async (req, res) => {
//     const order = await Order.findOne({
//         paddleTransactionId: req.params.transactionId,
//         user: req.user._id,
//     });
//     if (!order) {
//         res.status(404);
//         throw new Error("Order not found yet.");
//     }
//     res.json(order);
// });

// // We can add more admin functions here later if needed, like updating order status.

// module.exports = {
//     getMyOrders,
//     getAllOrders,
//     // verifyOrderToken,
//     getOrderByTransactionId,
// };

const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
// const Order = require("../models/orderModel.js");
const { Order, CartOrder } = require("../models/orderModel.js");

// @desc    Get all orders for the currently logged-in user (single & cart)
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const [singleOrders, cartOrders] = await Promise.all([
        Order.find({ user: userId })
            .populate("product", "name imageUrl fileUrl price")
            .sort({ createdAt: -1 }),

        CartOrder.find({ user: userId })
            .populate({
                path: "items.product",
                select: "name imageUrl fileUrl price",
                strictPopulate: false,
            })
            .sort({ createdAt: -1 }),
    ]);

    // Add type identifier for frontend to distinguish
    const formattedSingleOrders = singleOrders.map((order) => ({
        ...order.toObject(),
        type: "single",
    }));

    const formattedCartOrders = cartOrders.map((order) => ({
        ...order.toObject(),
        type: "cart",
    }));

    // Return unified flat array
    res.status(200).json([...formattedSingleOrders, ...formattedCartOrders]);
});

const getMyCartOrders = asyncHandler(async (req, res) => {
    const cartOrders = await CartOrder.find({ user: req.user._id })
        .populate("items.product", "name imageUrl")
        .sort({ createdAt: -1 });

    res.status(200).json(cartOrders);
});


const getAllOrders = asyncHandler(async (req, res) => {
    const search = (req.query.search || "").trim().toLowerCase();
    const sort = req.query.sort === "asc" ? "asc" : "desc"; // Default to "desc"
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [singleOrders, cartOrders] = await Promise.all([
        Order.find({})
            .populate("user", "name email")
            .populate("product", "name price imageUrl")
            .lean(),

        CartOrder.find({})
            .populate("user", "name email")
            .populate("items.product", "name price imageUrl")
            .lean(),
    ]);

    const normalizedSingleOrders = singleOrders.map((order) => ({
        ...order,
        type: "single",
        orderId: order._id.toString(),
        purchasePrice: order.product?.price || 0,
        product: order.product || null,
    }));

    const normalizedCartOrders = cartOrders.map((order) => ({
        ...order,
        type: "cart",
        orderId: order._id.toString(),
        purchasePrice: order.totalPrice || 0,
        product: {
            name:
                order.items?.length > 0
                    ? `${order.items[0]?.product?.name} +${order.items.length - 1} more`
                    : "No products",
        },
    }));

    let allOrders = [...normalizedSingleOrders, ...normalizedCartOrders];

    // Apply search
    if (search) {
        allOrders = allOrders.filter(
            (order) =>
                order.orderId?.toLowerCase().includes(search) ||
                order.paddleTransactionId?.toLowerCase().includes(search)
        );
    }

    // Sort orders
    allOrders.sort((a, b) =>
        sort === "asc"
            ? new Date(a.purchasedAt) - new Date(b.purchasedAt)
            : new Date(b.purchasedAt) - new Date(a.purchasedAt)
    );

    const totalOrders = allOrders.length;

    // Paginate orders
    const paginatedOrders = allOrders.slice(skip, skip + limit);

    res.json({
        totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        orders: paginatedOrders,
    });
});



// @desc    Get single order by Paddle transaction ID
// @route   GET /api/orders/transaction/:transactionId
// @access  Private
const getOrderByTransactionId = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const transactionId = req.params.transactionId;

    // First check single orders
    const order = await Order.findOne({
        paddleTransactionId: transactionId,
        user: userId,
    }).populate("product", "name imageUrl fileUrl");

    if (order) return res.json({ type: "single", order });

    // If not found, check cart orders
    const cartOrder = await CartOrder.findOne({
        paddleTransactionId: transactionId,
        user: userId,
    }).populate({
        path: "items.product",
        select: "name imageUrl fileUrl",
        strictPopulate: false, // necessary if schema isn't declared explicitly
    });

    if (!cartOrder) {
        res.status(404);
        throw new Error("Order not found yet.");
    }

    res.json({ type: "cart", order: cartOrder });
});

module.exports = {
    getMyOrders,
    getAllOrders,
    getOrderByTransactionId,
    getMyCartOrders,
};
