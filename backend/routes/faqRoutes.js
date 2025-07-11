const express = require('express');
const router = express.Router();
const {
    createFaq,
    getFaqs,
    getFaqById,
    updateFaq,
    deleteFaq,
} = require('../controllers/faqController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route to get all FAQs
router.route('/').get(getFaqs);

// Admin-only route to create a new FAQ
router.route('/').post(protect, admin, createFaq);

// Admin-only routes for a specific FAQ
router
    .route('/:id')
    .get(protect, admin, getFaqById)    // Get for editing
    .put(protect, admin, updateFaq)     // Update
    .delete(protect, admin, deleteFaq); // Delete

module.exports = router;