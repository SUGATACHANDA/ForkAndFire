const mongoose = require('mongoose');

const recipeStepSchema = mongoose.Schema({
    description: { type: String, required: true },
    image: { type: String }, // URL to the image for this step
});

const recipeSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    prepTime: { type: String, required: true }, // e.g., "15 minutes"
    cookTime: { type: String, required: true }, // e.g., "30 minutes"
    servings: { type: String, required: true }, // e.g., "4 people"
    ingredients: [{ type: String, required: true }],
    steps: [recipeStepSchema],
    mainImage: { type: String, required: true }, // URL to main image
    youtubeUrl: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' },
    author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    faqs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Faq' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;