const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    createTransactionForCheckout,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProductsAdmin
} = require('../controllers/productController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// --- Public Routes ---
router.route('/').get(getAllProducts);
router.route('/all').get(protect, admin, getAllProductsAdmin);
router.route('/:id').get(getProductById);

// --- Private (Logged-in User) Routes ---
router.route('/:id/checkout').post(protect, createTransactionForCheckout);

// --- Admin-Only Routes ---
router.route('/').post(protect, admin, createProduct);
router.route('/:id')
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);



module.exports = router;