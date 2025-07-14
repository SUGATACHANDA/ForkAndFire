const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController.js');
const { protect } = require('../middleware/authMiddleware.js');

// All cart routes are protected and apply to the logged-in user
router.route('/')
    .get(protect, getCart)
    .post(protect, addToCart)
    .delete(protect, clearCart);

router.route('/:productId').delete(protect, removeFromCart);

module.exports = router;