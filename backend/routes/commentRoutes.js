const express = require('express');
const router = express.Router();
const { getCommentsByRecipe,
    createComment,
    getAllComments,
    deleteComment } = require('../controllers/commentController.js');
const { protect, admin } = require('../middleware/authMiddleware.js'); // Import auth middleware

// Get all comments for a recipe - Public
router.get('/recipe/:recipeId', getCommentsByRecipe);
router.post('/', protect, createComment);

// --- Admin-Only Routes ---
router.route('/')
    .get(protect, admin, getAllComments); // Admin gets ALL comments

router.route('/:id')
    .delete(protect, admin, deleteComment);

module.exports = router;