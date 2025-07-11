const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    // Link to the user who made the purchase
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    // Link to the product that was purchased
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    },
    // Details about the specific transaction from Paddle
    paddleTransactionId: {
        type: String,
        required: true,
        unique: true, // Prevents duplicate order processing for the same transaction
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    purchasePrice: {
        type: Number, // Price in cents at the time of purchase
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['completed', 'refunded', 'pending'],
        default: 'completed',
    },
    purchasedAt: {
        type: Date,
        default: Date.now,
    },
    access_token: { type: String, unique: true, sparse: true }, // unique & sparse is good for tokens
    is_confirmation_viewed: { type: Boolean, default: false }
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;