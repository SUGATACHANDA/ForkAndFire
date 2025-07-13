/**
 * Creates a visually stunning, modern, and artistic HTML order confirmation email.
 * It displays the final, localized price the user paid.
 * @param {object} options
 * @param {string} options.recipientName - The customer's first name.
 * @param {string} options.recipientEmail - The customer's email for unsubscribe.
 * @param {object} options.order - The full, populated Order document.
 * @returns {string} The complete HTML email content.
 */
const createOrderConfirmationHtml = ({ recipientName, recipientEmail, order }) => {
    const siteUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const currentYear = new Date().getFullYear();
    const orderDate = new Date(order.purchasedAt).toLocaleDateString('en-US', { dateStyle: 'long' });

    const formatPrice = (amount, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
        }).format((amount || 0) / 100);
    };

    // We no longer need a formatPrice helper because Paddle gives us the final string.
    const finalPrice = order.displayPrice;

    const encodedEmail = Buffer.from(recipientEmail).toString('base64');
    const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${encodedEmail}`;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
        <style>
            body { margin:0; padding:0; background-color:#f9f9f9; -webkit-font-smoothing: antialiased; }
            table { border-collapse:collapse; }
            h1, h2, h3, p, a, span { font-family: 'Montserrat', sans-serif; }
            .playfair { font-family: 'Lora', serif; font-weight: 700; }
        </style>
    </head>
    <body style="background-color:#f9f9f9;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td align="center" style="padding:20px;">
                    <!-- Main Wrapper -->
                    <table style="width:100%; max-width:620px; margin:0 auto; background-color:#ffffff; border-radius:12px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1);">
                        
                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding:40px 0 20px 0;">
                                <h1 style="font-size:28px; color:#2c3e50; margin:0;" class="playfair">Fork & Fire</h1>
                            </td>
                        </tr>
                        
                        <!-- Thank You Message -->
                        <tr>
                            <td style="padding:0 30px;">
                                <h2 style="font-size:24px; color:#2c3e50; text-align:center;" class="playfair">Thank you for your order, ${recipientName}!</h2>
                                <p style="font-size:16px; color:#575757; line-height:1.6; text-align:center; margin:16px 0;">
                                    We've received your purchase and are getting it ready. You can find all your order details below.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Order Summary Card -->
                        <tr>
                            <td style="padding:30px;">
                                <table width="100%" style="background-color:#fafafa; border-radius:8px; border:1px solid #eee;">
                                    <tr>
                                        <td style="padding:20px;">
                                            <p style="font-size:12px; text-transform:uppercase; color:#718096; letter-spacing:1px; margin-bottom: 20px;">
                                                Order Summary  •  ${orderDate}
                                            </p>
                                            
                                            <!-- Item Row -->
                                            <table width="100%">
                                                <tr>                                                    
                                                    <td>
                                                        <p style="font-size:16px; font-weight:600; color:#2c3e50; margin:0;">${order.product?.name}</p>
                                                        <p style="font-size:14px; color:#718096; margin:4px 0 0 0;">Quantity: ${order.quantity}</p>
                                                    </td>
                                                    <td align="right" style="font-size:16px; font-weight:600; color:#2c3e50;">
                                                        ${formatPrice(order.product?.price * 100 * order.quantity, order.product.currency)}
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <div style="height:1px; background-color:#eee; margin:20px 0;"></div>
                                            
                                            <!-- Total Row -->
                                            <table width="100%">
                                                <tr>
                                                    <td>
                                                        <p style="font-size:18px; font-weight:bold; color:#2c3e50; margin:0;" class="playfair">Grand Total (in Local Price)</p>
                                                    </td>
                                                    <td align="right" style="font-size:20px; font-weight:bold; color:#2c3e50;">
                                                        ${formatPrice(finalPrice, order.currency)}
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Call to Action -->
                        <tr>
                             <td align="center" style="padding:0 30px 40px 30px;">
                                 <a href="${siteUrl}/my-orders" style="background:#e67e22; text-decoration:none; padding:15px 35px; color:#ffffff; border-radius:50px; display:inline-block; font-weight:bold;">
                                    View Your Order History
                                 </a>
                            </td>
                        </tr>

                        <!-- Footer -->
                         <tr>
                            <td style="padding:20px 30px; text-align:center; background-color:#f0f2f5; border-top:1px solid #e2e8f0;">
                                 <p style="font-size:12px; color:#718096; line-height:1.6;">
                                     If you have any questions, reply to this email. We're happy to help!<br/>
                                     © ${currentYear} Fork & Fire Kitchen. All rights reserved.
                                     <a href="${unsubscribeUrl}" style="color:#718096;text-decoration:underline;margin-left:5px;">Unsubscribe</a>.
                                 </p>
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