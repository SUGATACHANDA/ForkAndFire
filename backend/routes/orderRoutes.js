// const express = require('express');
// const router = express.Router();
// const { getMyOrders, getAllOrders, verifyOrderToken, getOrderByTransactionId } = require('../controllers/orderController.js');
// const { protect, admin } = require('../middleware/authMiddleware.js');

// // --- User-Specific Route ---
// // This route is protected by `protect` so only a logged-in user can access their own orders.
// router.get('/my-orders', protect, getMyOrders);

// // --- Admin-Specific Route ---
// // This route is protected by `admin`, so only an admin user can get a list of all orders.
// router.get('/all-orders', protect, admin, getAllOrders);
// // router.route('/verify-token').post(protect, verifyOrderToken);
// router.get('/by-transaction/:transactionId', protect, getOrderByTransactionId);

// module.exports = router;

const express = require('express');
const router = express.Router();

const {
    getMyOrders,
    getAllOrders,
    getOrderByTransactionId,
    getMyCartOrders
} = require('../controllers/orderController.js');

const { protect, admin } = require('../middleware/authMiddleware.js');

// --- User: Get all their orders (single + cart) ---
router.get('/my-orders', protect, getMyOrders);

// --- Admin: Get all orders (single + cart) ---
router.get('/all-orders', protect, admin, getAllOrders);

// --- User: Get a specific order (single or cart) by transaction ID ---
router.get('/by-transaction/:transactionId', protect, getOrderByTransactionId);

router.get('/my-cart-orders', protect, getMyCartOrders);

module.exports = router;
