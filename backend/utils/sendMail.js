const nodemailer = require('nodemailer');

// This function now expects 'to' to be a single email address.
const sendEmail = async (options) => {
    // 1. Create a transporter object using Gmail's SMTP settings
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10), // Ensure port is an integer
        secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // This is the App Password
        },
        // --- Optional, but can help with deliverability/debugging ---
        tls: {
            rejectUnauthorized: false
        }
    });

    // 2. Define the email options
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };

    // 3. Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent via Gmail to ${options.to}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`ERROR sending email via Gmail to ${options.to}:`, error);
        throw new Error(`Nodemailer failed with Gmail: ${error.message}`);
    }
};

module.exports = sendEmail;