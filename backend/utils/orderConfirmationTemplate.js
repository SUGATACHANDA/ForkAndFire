/**
 * Creates a professional and elegant HTML email template for order confirmations.
 * @param {object} options
 * @param {string} options.recipientName - The name of the customer.
 * @param {object} options.order - The full order object from our database, populated with product details.
 * @returns {string} The complete, styled HTML email content.
 */
const createOrderConfirmationHtml = ({ recipientName, order }) => {
    const siteUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const currentYear = new Date().getFullYear();
    const orderDate = new Date(order.purchasedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    // Helper to format price correctly from cents
    const formatPrice = (amount, currency) => new Intl.NumberFormat('en-US', {
        style: 'currency', currency: currency || 'USD'
    }).format((amount || 0) / 100);

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Lora:wght@700&family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
        <style>
            body { margin:0; padding:0; background-color:#f7fafc; }
            table { border-collapse:collapse; }
            h1, h2, h3, p { font-family: 'Montserrat', sans-serif; margin:0; }
            h1, h2, h3 { font-family: 'Lora', serif; }
        </style>
    </head>
    <body style="font-family:'Montserrat',sans-serif;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f7fafc">
            <tr>
                <td align="center" style="padding:20px;">
                    <table style="max-width:600px;width:100%;background:#ffffff;box-shadow:0 10px 30px -15px rgba(0,0,0,0.1);border:1px solid #e2e8f0;">
                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding:30px; border-bottom: 1px solid #e2e8f0;">
                                <h1 style="font-size:28px;color:#2c3e50;">Fork & Fire Kitchen</h1>
                            </td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="padding:40px;">
                                <h2 style="font-size:24px;color:#2c3e50;">Thank You for Your Order!</h2>
                                <p style="font-size:16px;color:#575757;line-height:1.6;margin:16px 0;">
                                    Hi ${recipientName}, we've successfully processed your payment. Here are the details of your recent purchase.
                                </p>
                                
                                <!-- Order Details Table -->
                                <table width="100%" style="margin: 30px 0;">
                                    <tr style="background-color:#f7fafc;text-align:left;">
                                        <th style="padding:12px;font-size:12px;text-transform:uppercase;color:#718096;width:60%;">Item</th>
                                        <th style="padding:12px;font-size:12px;text-transform:uppercase;color:#718096;text-align:center;">Qty</th>
                                        <th style="padding:12px;font-size:12px;text-transform:uppercase;color:#718096;text-align:right;">Price</th>
                                    </tr>
                                    <!-- Product Row -->
                                    <tr>
                                        <td style="padding:15px 12px;border-bottom:1px solid #e2e8f0;">
                                            <p style="margin:0;font-weight:600;font-size:16px;color:#2c3e50;">${order.product.name}</p>
                                        </td>
                                        <td style="padding:15px 12px;text-align:center;border-bottom:1px solid #e2e8f0;color:#575757;">
                                            ${order.quantity}
                                        </td>
                                        <td style="padding:15px 12px;text-align:right;border-bottom:1px solid #e2e8f0;color:#575757;">
                                            ${formatPrice(order.product.price * 100, order.currency)}
                                        </td>
                                    </tr>
                                </table>

                                <!-- Total Section -->
                                <table width="100%" align="right" style="max-width:250px; margin-left:auto;">
                                    <tr>
                                        <td style="font-size:16px;color:#575757;padding:5px;">Subtotal</td>
                                        <td style="font-size:16px;color:#575757;padding:5px;text-align:right;">${formatPrice(order.purchasePrice, order.currency)}</td>
                                    </tr>
                                    <!-- You can add tax from the webhook payload here if needed -->
                                    <tr>
                                        <td style="font-size:16px;color:#2c3e50;padding:5px;font-weight:bold;border-top:2px solid #e2e8f0;">Grand Total</td>
                                        <td style="font-size:16px;color:#2c3e50;padding:5px;text-align:right;font-weight:bold;border-top:2px solid #e2e8f0;">${formatPrice(order.purchasePrice, order.currency)}</td>
                                    </tr>
                                </table>
                                
                                <p style="font-size:14px;color:#575757;text-align:center;margin-top:40px;">Order Date: ${orderDate}  •  Transaction ID: ${order.paddleTransactionId}</p>

                                <div style="text-align:center;margin-top:30px;">
                                    <a href="${siteUrl}/my-orders" style="background:#e67e22;text-decoration:none;padding:12px 25px;color:#ffffff;border-radius:5px;display:inline-block;font-weight:bold;">View My Orders</a>
                                </div>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr><td style="padding:30px;background:#2c3e50;text-align:center;color:#98a0a9;font-size:12px;"><p>© ${currentYear} Fork & Fire Kitchen. All Rights Reserved.</p></td></tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

module.exports = createOrderConfirmationHtml;