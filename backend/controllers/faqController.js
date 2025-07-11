const asyncHandler = require('express-async-handler');
const Faq = require('../models/faqModel.js');

// @desc    Create a new FAQ
// @route   POST /api/faqs
// @access  Private/Admin
const createFaq = asyncHandler(async (req, res) => {
    const { question, answer } = req.body;

    if (!question || !answer) {
        res.status(400);
        throw new Error('Question and Answer are required');
    }

    const faq = new Faq({
        question,
        answer,
    });

    const createdFaq = await faq.save();
    res.status(201).json(createdFaq);
});

// @desc    Get all FAQs
// @route   GET /api/faqs
// @access  Public
const getFaqs = asyncHandler(async (req, res) => {
    const faqs = await Faq.find({});
    res.json(faqs);
});

// @desc    Get a single FAQ by ID
// @route   GET /api/faqs/:id
// @access  Private/Admin
const getFaqById = asyncHandler(async (req, res) => {
    const faq = await Faq.findById(req.params.id);

    if (faq) {
        res.json(faq);
    } else {
        res.status(404);
        throw new Error('FAQ not found');
    }
});

// @desc    Update an FAQ
// @route   PUT /api/faqs/:id
// @access  Private/Admin
const updateFaq = asyncHandler(async (req, res) => {
    const { question, answer } = req.body;

    const faq = await Faq.findById(req.params.id);

    if (faq) {
        faq.question = question || faq.question;
        faq.answer = answer || faq.answer;

        const updatedFaq = await faq.save();
        res.json(updatedFaq);
    } else {
        res.status(404);
        throw new Error('FAQ not found');
    }
});

// @desc    Delete an FAQ
// @route   DELETE /api/faqs/:id
// @access  Private/Admin
const deleteFaq = asyncHandler(async (req, res) => {
    const faq = await Faq.findByIdAndDelete(req.params.id);

    if (faq) {
        res.json({ message: 'FAQ removed successfully' });
    } else {
        res.status(404);
        throw new Error('FAQ not found');
    }
});

module.exports = {
    createFaq,
    getFaqs,
    getFaqById,
    updateFaq,
    deleteFaq,
};