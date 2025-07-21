const mongoose = require('mongoose');

// --- 🧾 Single Product Order Schema ---
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
    },
    paddleTransactionId: {
        type: String,
        required: true,
        unique: true, // Ensure no duplicate transactions
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    purchasePrice: {
        type: Number, // Price in cents
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
    displayPrice: {
        type: String,
        required: true,
    },
    markAsComplete: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);


// --- 🛒 Cart-Based Multi-Item Order Schema ---
const cartOrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            }
        }
    ],
    paddleTransactionId: {
        type: String,
        required: true,
        unique: true,
    },
    purchasePrice: {
        type: Number,
        required: true,
    },
    displayPrice: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'refunded'],
        default: 'completed',
    },
    purchasedAt: {
        type: Date,
        default: Date.now,
    },
    markAsComplete: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const CartOrder = mongoose.model('CartOrder', cartOrderSchema);

module.exports = {
    CartOrder,
    Order
};
