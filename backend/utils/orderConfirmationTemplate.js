/**
 * Creates a professional, elegant, and fully functional HTML email template for order confirmations.
 * This version correctly formats all order details and is designed for maximum compatibility.
 * @param {object} options
 * @param {string} options.recipientName - The first name of the customer (e.g., "Sugata").
 * @param {string} options.recipientEmail - The customer's full email address for the unsubscribe link.
 * @param {object} options.order - The full Mongoose order object, populated with product details.
 * @returns {string} The complete, styled HTML email content.
 */
const createOrderConfirmationHtml = ({ recipientName, recipientEmail, order }) => {
    // --- Configuration ---
    const siteUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const currentYear = new Date().getFullYear();

    // --- Helper Functions ---
    // Formats the date into a readable format, e.g., "July 15, 2025"
    const orderDate = new Date(order.purchasedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    // Formats a number (in cents) into a currency string, e.g., "$29.99"
    const formatPrice = (amount, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
        }).format((amount || 0) / 100);
    };

    // Base64 encode the email for a safe unsubscribe link
    const encodedEmail = Buffer.from(recipientEmail).toString('base64');
    const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${encodedEmail}`;

    // --- Main HTML Email Template ---
    return `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <meta name="x-apple-disable-message-reformatting">
        <title>Order Confirmation</title>
        <!--[if mso]>
        <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
        <![endif]-->
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,700;1,400&family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
        <style>
            table, td, div, h1, h2, h3, p { font-family: 'Montserrat', sans-serif; box-sizing: border-box; }
            h1, h2, h3, h4, h5 { font-family: 'Lora', serif; font-weight: 700; }
            /* Styles for the content generated from your TipTap editor */
            .user-content p { line-height: 1.7; color: #575757; font-size: 16px; margin: 1em 0; }
            .user-content h3 { font-size: 22px; color: #2c3e50; margin: 1.5em 0 0.5em 0;}
            .user-content a { color: #e67e22; text-decoration: underline; font-weight: bold; }
        </style>
    </head>
    <body style="margin:0;padding:0;background-color:#f7fafc;">
        <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#f7fafc;">
            <tr>
                <td align="center" style="padding:20px;">
                    <table role="presentation" style="max-width:600px;width:100%;border-collapse:collapse;border-spacing:0;text-align:left;background:#ffffff;box-shadow:0 10px 30px -15px rgba(0,0,0,0.1);border:1px solid #e2e8f0;">
                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding:30px; border-bottom: 1px solid #e2e8f0;">
                                <h1 style="font-size:28px;color:#2c3e50;margin:0;">Fork & Fire Kitchen</h1>
                            </td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="padding:40px;">
                                <h2 style="font-size:24px;color:#2c3e50;">Thank You for Your Order!</h2>
                                <p style="font-size:16px;color:#575757;line-height:1.6;margin:16px 0;">
                                    Hi ${recipientName}, we've successfully processed your payment. Here is a summary of your recent purchase.
                                </p>
                                
                                <!-- Order Details Table -->
                                <table width="100%" style="margin: 30px 0; border-collapse: collapse;">
                                    <tr style="background-color:#f7fafc;">
                                        <th style="padding:12px;font-size:12px;text-transform:uppercase;color:#718096;text-align:left;width:60%;">Item</th>
                                        <th style="padding:12px;font-size:12px;text-transform:uppercase;color:#718096;text-align:center;">Qty</th>
                                        <th style="padding:12px;font-size:12px;text-transform:uppercase;color:#718096;text-align:right;">Price</th>
                                    </tr>
                                    <!-- Product Row -->
                                    <tr>
                                        <td style="padding:15px 12px;border-bottom:1px solid #e2e8f0; vertical-align: top;">
                                            <p style="margin:0;font-weight:600;font-size:16px;color:#2c3e50;">${order.product?.name || "Product Name not available"}</p>
                                        </td>
                                        <td style="padding:15px 12px;text-align:center;border-bottom:1px solid #e2e8f0;color:#575757;vertical-align: top;">
                                            ${order.quantity}
                                        </td>
                                        <td style="padding:15px 12px;text-align:right;border-bottom:1px solid #e2e8f0;color:#575757;vertical-align: top;">
                                            ${formatPrice(order.product?.price * 100 * order.quantity, order.currency)}
                                        </td>
                                    </tr>
                                </table>

                                <!-- Total Section -->
                                <table width="100%" align="right" style="max-width:280px; margin-left:auto;">
                                    <tr>
                                        <td style="font-size:16px;color:#2c3e50;padding:5px;font-weight:bold;border-top:2px solid #e2e8f0;">Grand Total</td>
                                        <td style="font-size:16px;color:#2c3e50;padding:5px;text-align:right;font-weight:bold;border-top:2px solid #e2e8f0;">${formatPrice(order.purchasePrice, order.currency)}</td>
                                    </tr>
                                </table>
                                
                                <!-- Correctly Formatted Order Date & Transaction ID -->
                                <table width="100%" style="margin: 40px 0; text-align: center; font-family: 'Montserrat', sans-serif; font-size: 13px; color: #575757; line-height: 1.6;">
                                    <tr><td><strong>Order Date:</strong><br>${orderDate}</td></tr>
                                    <tr><td style="font-size:15px; line-height:15px;"> </td></tr>
                                    <tr><td><strong>Transaction ID:</strong><br>${order.paddleTransactionId}</td></tr>
                                </table>
                                
                                <!-- Call to Action -->
                                <div style="text-align:center;margin-top:30px;">
                                    <a href="${siteUrl}/my-orders" style="background:#e67e22;text-decoration:none;padding:12px 25px;color:#ffffff;border-radius:5px;display:inline-block;font-weight:bold;">View All My Orders</a>
                                </div>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="padding:30px;background:#2c3e50;text-align:center;color:#98a0a9;font-size:12px;">
                                <p style="margin:0;">© ${currentYear} Fork & Fire Kitchen. All Rights Reserved.</p>
                                <p style="margin-top: 5px;">Want to change how you receive these emails? You can <a href="${unsubscribeUrl}" style="color:#98a0a9;text-decoration:underline;">unsubscribe here</a>.</p>
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