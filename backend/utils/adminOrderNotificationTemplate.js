/**
 * Creates a functional HTML email to notify an admin of a new order (single or cart).
 * @param {object} options
 * @param {object} order - The full, populated Order document.
 * @returns {string} The complete HTML email content for the admin.
 */
const createAdminOrderNotificationHtml = ({ order }) => {
    const adminOrdersUrl = `${process.env.FRONTEND_URL}/admin/orders`;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <style> /* ... same styles as before ... */ </style>
    </head>
    <body bgcolor="#f2f4f6">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td align="center" style="padding: 20px;">
                    <table style="width:100%; max-width:600px; ...">
                        <!-- Header -->
                        <tr><td align="center" style="padding: 24px; ..."><h1 style="font-size:24px; ...">🎉 New Order Received!</h1></td></tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td class="content">
                                <h2 style="font-size: 20px; ...">A new purchase was made for ${order.displayPrice}.</h2>
                                
                                <!-- Order Details Table -->
                                <table class="details-table" width="100%">
                                    <tr><td style="color:#718096; width:150px;">Customer:</td><td style="font-weight:600; ...">${order.user.name} (${order.user.email})</td></tr>
                                    <!-- DYNAMIC ITEM ROWS -->
                                    ${order.products.map((item, index) => `
                                        <tr style="${index === 0 ? 'border-top:1px solid #e8eaed;' : ''}">
                                            <td style="color:#718096;">${index === 0 ? 'Item(s):' : ''}</td>
                                            <td style="font-weight:600;">${item.product.name} (x${item.quantity})</td>
                                        </tr>
                                    `).join('')}
                                    <tr><td style="color:#718096;">Total Paid:</td><td style="font-weight:600;">${order.displayPrice}</td></tr>
                                    <tr style="border-bottom:none;"><td style="color:#718096;">Transaction ID:</td><td style="font-weight:600; font-size:12px;">${order.paddleTransactionId}</td></tr>
                                </table>

                                <div style="text-align:center; padding: 32px 0 16px 0;"><a href="${adminOrdersUrl}" style="background-color:#e67e22; ...">View Order in Admin Panel</a></div>
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