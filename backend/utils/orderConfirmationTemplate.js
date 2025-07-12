/**
 * Creates a professional and elegant HTML email template for order confirmations.
 * @param {object} options
 * @param {string} options.recipientName - The name of the customer.
 * @param {string} options.recipientEmail - The customer's email for the unsubscribe link.
 * @param {object} options.order - The full order object, populated with product details.
 * @returns {string} The complete, styled HTML email content.
 */
const createOrderConfirmationHtml = ({ recipientName, recipientEmail, order }) => {
    // --- Configuration and Helpers ---
    const siteUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const currentYear = new Date().getFullYear();

    // Format the date for a more readable display
    const orderDate = new Date(order.purchasedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const formatPrice = (amount, currency) => new Intl.NumberFormat('en-US', {
        style: 'currency', currency: currency || 'USD'
    }).format((amount || 0) / 100);

    const encodedEmail = Buffer.from(recipientEmail).toString('base64');
    const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${encodedEmail}`;

    // --- Main HTML Template ---
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        {/* ... All head content and styles remain the same ... */}
        <style>
            .user-content p { /* ... */ }
            /* Add a style for our new footer info */
            .footer-info { font-size: 13px; color: #575757; line-height: 1.6; }
        </style>
    </head>
    <body style="font-family:'Montserrat',sans-serif;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f7fafc">
            <tr>
                <td align="center" style="padding:20px;">
                    <table style="max-width:600px;width:100%;background:#ffffff;box-shadow:0 10px 30px -15px rgba(0,0,0,0.1);border:1px solid #e2e8f0;">
                        <!-- Header and Main Content (no changes here) -->
                        {/* ... */}
                        <tr>
                            <td style="padding:40px;">
                                {/* ... Greeting, Subject, Order Details Table, Totals ... */}

                                <!-- === THE FIX IS HERE: Updated Order Info Section === -->
                                <!-- This table ensures perfect alignment and spacing for the order details. -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 40px; text-align: center;">
                                    <tr>
                                        <td class="footer-info">
                                            <strong>Order Date:</strong><br/>
                                            ${orderDate}
                                        </td>
                                    </tr>
                                    <tr><td style="font-size:15px; line-height:15px;"> </td></tr> <!-- Vertical spacer -->
                                    <tr>
                                        <td class="footer-info">
                                            <strong>Transaction ID:</strong><br/>
                                            ${order.paddleTransactionId}
                                        </td>
                                    </tr>
                                </table>
                                
                                <div style="text-align:center;margin-top:30px;">
                                    <a href="${siteUrl}/my-orders" style="background:#e67e22;text-decoration:none;padding:12px 25px;color:#ffffff;border-radius:5px;display:inline-block;font-weight:bold;">View My Orders</a>
                                </div>
                            </td>
                        </tr>
                        <!-- Footer with unsubscribe link -->
                        <tr>
                            <td style="padding:30px;background:#2c3e50;text-align:center;color:#98a0a9;font-size:12px;">
                                <p>© ${currentYear} Fork & Fire Kitchen. All Rights Reserved.</p>
                                <p style="margin-top: 5px;">Want to change how you receive these emails? You can <a href="${unsubscribeUrl}" style="color:#98a0a9;">unsubscribe here</a>.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

module.exports = createOrderConfirmationHtml;