const asyncHandler = require('express-async-handler');
const Comment = require('../models/commentModel.js');
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendMail.js');

// @desc    Get all comments for a single recipe
// @route   GET /api/comments/recipe/:recipeId
// @access  Public
const getCommentsByRecipe = asyncHandler(async (req, res) => {
    const { recipeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
        res.status(400);
        throw new Error('Invalid Recipe ID');
    }

    // Find comments, populate with the user's name, and sort by newest first
    const comments = await Comment.find({ recipe: recipeId })
        .populate('user', 'name')
        .sort({ createdAt: -1 });

    res.status(200).json(comments);
});


// @desc    Create a new comment
// @route   POST /api/comments
// @access  Private (User must be logged in)
const createComment = asyncHandler(async (req, res) => {
    const { recipeId, text } = req.body;

    if (!text || text.trim() === '') {
        res.status(400);
        throw new Error('Comment text cannot be empty.');
    }

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
        res.status(400);
        throw new Error('Invalid Recipe ID');
    }

    // Create the comment object
    const comment = new Comment({
        recipe: recipeId,
        text: text,
        user: req.user._id, // `req.user` comes from our `protect` auth middleware
    });

    const createdComment = await comment.save();

    // Populate the newly created comment with user info before sending it back
    const populatedComment = await Comment.findById(createdComment._id).populate('user', 'name').populate('recipe', 'title');;

    if (populatedComment) {
        try {
            const adminEmail = process.env.ADMIN_EMAIL_ADDRESS || process.env.EMAIL_USER; // An admin email from .env
            const siteUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

            await sendEmail({
                to: adminEmail,
                subject: `New Comment on "${populatedComment.recipe.title}"`,
                html: `
                    <p>A new comment has been posted on your recipe.</p>
                    <p><strong>Recipe:</strong> ${populatedComment.recipe.title}</p>
                    <p><strong>Author:</strong> ${populatedComment.user.name}</p>
                    <p><strong>Comment:</strong></p>
                    <blockquote style="border-left: 2px solid #ccc; padding-left: 10px; margin-left: 5px; font-style: italic;">
                        ${populatedComment.text}
                    </blockquote>
                    <p><a href="${siteUrl}/recipe/${populatedComment.recipe._id}">Click here to view the comment on the recipe page.</a></p>
                `,
            });
        } catch (emailError) {
            // Log the error but don't fail the entire request, as the comment was successfully saved.
            console.error("Failed to send new comment notification email:", emailError);
        }
    }

    const commentForFE = await Comment.findById(createdComment._id).populate('user', 'name');
    res.status(201).json(commentForFE);
});

const getAllComments = asyncHandler(async (req, res) => {
    // Populate with user name and recipe title
    const comments = await Comment.find({})
        .populate('user', 'name')
        .populate('recipe', 'title')
        .sort({ createdAt: -1 }); // Show newest first

    res.status(200).json(comments);
});

const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400); throw new Error('Invalid Comment ID');
    }

    const comment = await Comment.findByIdAndDelete(id);

    if (comment) {
        res.status(200).json({ message: 'Comment deleted successfully.' });
    } else {
        res.status(404); throw new Error('Comment not found.');
    }
});

module.exports = {
    getCommentsByRecipe,
    createComment,
    getAllComments,    // <-- Export new functions
    deleteComment,
};