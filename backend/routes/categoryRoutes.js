const express = require('express');
const router = express.Router();
const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route to get all categories
router.route('/').get(getCategories);

// Admin-only route to create a new category
router.route('/').post(protect, admin, createCategory);

// Admin-only routes for a specific category
router
    .route('/:id')
    .get(protect, admin, getCategoryById)   // Get for editing purposes
    .put(protect, admin, updateCategory)    // Update
    .delete(protect, admin, deleteCategory); // Delete

module.exports = router;