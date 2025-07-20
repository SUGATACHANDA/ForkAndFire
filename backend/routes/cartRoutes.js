const express = require('express');
const Cart = require('../models/cartModel')
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getCart, deleteFromCart, saveToCart, updateCartItem, createTransactionForCart } = require('../controllers/cartController');

router.post("/checkout", protect, createTransactionForCart);

router.route('/').post(protect, saveToCart).get(protect, getCart);
router.delete('/delete/:productId', protect, deleteFromCart);;
router.put('/update', protect, updateCartItem);

module.exports = router;
