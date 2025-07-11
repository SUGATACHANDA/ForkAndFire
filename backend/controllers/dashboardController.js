const asyncHandler = require('express-async-handler');
const Recipe = require('../models/recipeModel.js');
const User = require('../models/userModel.js');
const Category = require('../models/categoryModel.js');
const Faq = require('../models/faqModel.js');
const Product = require('../models/productModel.js');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    // We use `countDocuments()` which is highly efficient for getting counts.
    // `Promise.all` runs all these database queries concurrently for speed.
    try {
        const [recipeCount, userCount, categoryCount, faqCount, productCount] = await Promise.all([
            Recipe.countDocuments({}),
            User.countDocuments({}),
            Category.countDocuments({}),
            Faq.countDocuments({}),
            Product.countDocuments({})
        ]);

        res.json({
            recipes: recipeCount,
            users: userCount,
            categories: categoryCount,
            faqs: faqCount,
            products: productCount,
        });
    } catch (error) {
        res.status(500);
        throw new Error('Could not fetch dashboard statistics');
    }
});

module.exports = {
    getDashboardStats,
};