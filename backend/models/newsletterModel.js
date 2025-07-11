const mongoose = require('mongoose');

const newsletterSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        // The name is not required, making the form simpler if desired
    },
    email: {
        type: String,
        required: [true, 'Email address is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    subscribedAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

module.exports = Newsletter;