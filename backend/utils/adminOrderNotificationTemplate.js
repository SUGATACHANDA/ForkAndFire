/**
 * Creates a clean, functional HTML email for notifying an admin of a new order.
 * @param {object} options
 * @param {object} order - The full, populated Order document.
 * @returns {string} The complete HTML email content for the admin.
 */
const createAdminOrderNotificationHtml = ({ order }) => {
    // --- Configuration ---
    // The admin panel URL. Adjust if your admin routes are different.
    const adminOrdersUrl = `${process.env.FRONTEND_URL}/admin/orders`;
    const productUrl = `${process.env.FRONTEND_URL}/product/${order.product?._id}`;

    // Helper to format price from cents
    const formatPrice = (amount, currency) => new Intl.NumberFormat('en-US', {
        style: 'currency', currency: currency || 'USD'
    }).format((amount || 0) / 100);

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { margin:0; padding:0; background-color:#f2f4f6; font-family:-apple-system,BlinkMacSystemFont, 'Segoe UI',Roboto,Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol';}
            table { border-collapse:collapse; }
            h1,h2,h3,p { margin:0; }
            a { color:#e67e22; text-decoration:none; }
            .content { padding: 32px; }
            .details-table td { padding: 12px 0; border-bottom: 1px solid #e8eaed; font-size: 14px; }
        </style>
    </head>
    <body bgcolor="#f2f4f6">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td align="center" style="padding: 20px;">
                    <table style="width:100%; max-width:600px; background-color:#ffffff; border-radius: 8px; box-shadow: 0 4px 12px -5px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding: 24px; border-bottom:1px solid #e8eaed;">
                                <h1 style="font-size:24px; font-weight:bold; color:#2c3e50;">New Order at Fork & Fire!</h1>
                            </td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td class="content">
                                <h2 style="font-size: 20px; font-weight:bold; color:#2c3e50; margin-bottom:24px;">A new purchase has been made.</h2>
                                
                                <!-- Order Details Table -->
                                <table class="details-table" width="100%">
                                    <tr>
                                        <td style="color:#718096; width:150px;">Customer:</td>
                                        <td style="font-weight:600; color:#2c3e50;">${order.user.name} (${order.user.email})</td>
                                    </tr>
                                     <tr>
                                        <td style="color:#718096;">Product:</td>
                                        <td style="font-weight:600;"><a href="${productUrl}" target="_blank">${order.product.name}</a></td>
                                    </tr>
                                    <tr>
                                        <td style="color:#718096;">Quantity:</td>
                                        <td style="font-weight:600; color:#2c3e50;">${order.quantity}</td>
                                    </tr>
                                     <tr style="border-bottom:none;">
                                        <td style="color:#718096;">Amount:</td>
                                        <td style="font-weight:600; color:#2c3e50;">${formatPrice(order.displayPrice, order.currency)}</td>
                                    </tr>
                                </table>

                                 <!-- Call to Action -->
                                <div style="text-align:center; padding: 32px 0 16px 0;">
                                    <a href="${adminOrdersUrl}" style="background-color:#e67e22; border-radius:6px; color:#ffffff; display:inline-block; font-size:16px; font-weight:bold; padding:12px 24px; text-decoration:none;">
                                        View All Orders
                                    </a>
                                </div>
                            </td>
                        </tr>

                        <!-- Footer -->
                         <tr>
                            <td style="padding:16px; text-align:center; font-size:12px; color:#99a2ad; background-color:#f2f4f6; border-bottom-left-radius:8px; border-bottom-right-radius:8px;">
                                <p>Transaction ID: ${order.paddleTransactionId}</p>
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

module.exports = createAdminOrderNotificationHtml;