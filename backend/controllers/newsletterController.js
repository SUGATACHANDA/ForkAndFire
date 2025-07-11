const asyncHandler = require('express-async-handler');
const Newsletter = require('../models/newsletterModel.js');
const User = require('../models/userModel.js');
const sendEmail = require('../utils/sendMail.js') // Import User model for an edge case
const createNewsletterHtml = require('../utils/newsletterTemplate.js');

// @desc    Subscribe to the newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribeToNewsletter = asyncHandler(async (req, res) => {
    // Destructure both name and email from the request body
    const { name, email } = req.body;

    if (!email) {
        res.status(400); throw new Error('Email is required.');
    }

    const existingSubscription = await Newsletter.findOne({ email });

    if (existingSubscription) {
        // If they already exist but are now providing a name, update their record.
        if (name && !existingSubscription.name) {
            existingSubscription.name = name;
            await existingSubscription.save();
        }
        res.status(200).json({ message: 'You are already on our list. Thank you!' });
        return;
    }

    // Create the new subscription record with the name field
    await Newsletter.create({ name: name || '', email });

    // Also, update the corresponding User document if it exists
    const user = await User.findOne({ email });
    if (user && !user.newsletter) {
        user.newsletter = true;
        await user.save();
    }

    res.status(201).json({ message: 'Thank you for subscribing to our newsletter!' });
});

const sendNewsletter = asyncHandler(async (req, res) => {
    const { subject, htmlContent } = req.body;

    if (!subject || !htmlContent) {
        res.status(400); throw new Error('Subject and content are required.');
    }

    const subscribers = await Newsletter.find({}, 'email');
    if (subscribers.length === 0) {
        res.status(404); throw new Error('No subscribers found.');
    }
    const subscriberEmails = subscribers.map(sub => sub.email);

    const users = await User.find({ email: { $in: subscriberEmails } }, 'name email');
    const userMap = new Map(users.map(user => [user.email, user.name]));

    const emailPromises = [];
    let successfulSends = 0;

    for (const email of subscriberEmails) {
        const name = userMap.get(email);
        const firstName = name ? name.split(' ')[0] : 'Food Lover';

        const finalHtml = createNewsletterHtml({
            recipientName: firstName,
            subject: subject,
            htmlContent: htmlContent,
            recipientEmail: email, // <-- Pass the recipient's email to the template
        });

        // 3. Send the complete HTML in the email
        emailPromises.push(
            sendEmail({
                to: email,
                subject: subject,
                html: finalHtml, // Send the final template, not the raw content
            }).catch(error => ({ status: 'failed', reason: error.message }))
        );
    }

    const results = await Promise.allSettled(emailPromises);
    results.forEach(result => {
        if (result.status === 'fulfilled' && !result.value?.status) {
            successfulSends++;
        }
    });

    if (successfulSends < results.length) {
        res.status(207).json({ message: `Newsletter dispatch completed. ${successfulSends} sent successfully, ${results.length - successfulSends} failed.` });
    } else {
        res.status(200).json({ message: `Newsletter sent successfully to all ${successfulSends} subscribers.` });
    }
});

const unsubscribeFromNewsletter = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Email address is required to unsubscribe.');
    }

    // Find and delete the subscription from the Newsletter collection
    const subscription = await Newsletter.findOneAndDelete({ email: email.toLowerCase() });

    // Also, find the corresponding user (if they exist) and set their newsletter flag to false
    await User.updateOne({ email: email.toLowerCase() }, { $set: { newsletter: false } });

    if (!subscription) {
        // Even if they weren't in the list, send a success message.
        // This prevents people from checking if an email is in your database.
        return res.status(200).json({ message: "You have been successfully unsubscribed." });
    }

    res.status(200).json({ message: "You have been successfully unsubscribed." });
});

module.exports = {
    subscribeToNewsletter,
    sendNewsletter,
    unsubscribeFromNewsletter
};