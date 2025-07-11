/**
 * Creates a modern, vibrant, and elegant HTML newsletter template focused on a beautiful header image.
 * This design is clean, typography-driven, and highly compatible with all email clients.
 * @param {object} options
 * @param {string} options.recipientName - The personalized name of the recipient.
 * @param {string} options.subject - The email subject line.
 * @param {string} options.htmlContent - The main body HTML from the TipTap editor.
 * @returns {string} The complete, styled HTML email content.
 */
const createNewsletterHtml = ({ recipientName, subject, htmlContent, recipientEmail }) => {
    // --- Configuration ---
    const siteUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const currentYear = new Date().getFullYear();
    const heroImageUrl = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=853&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

    const encodedEmail = Buffer.from(recipientEmail).toString('base64');
    const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${encodedEmail}`;

    // --- Main Template ---
    return `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <meta name="x-apple-disable-message-reformatting">
        <title></title>
        <!--[if mso]>
        <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
        <![endif]-->
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,700;1,400&family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
        <style>
            table, td, div, h1, p {font-family: 'Montserrat', sans-serif; box-sizing: border-box;}
            h1, h2, h3, h4, h5 {font-family: 'Lora', serif; font-weight: 700;}
            .user-content p { line-height: 1.7; color: #575757; font-size: 16px; margin: 1em 0; }
            .user-content h3 { font-size: 22px; color: #2c3e50; margin: 1.5em 0 0.5em 0;}
            .user-content a { color: #e67e22; text-decoration: underline; font-weight: bold; }
        </style>
    </head>
    <body style="margin:0;padding:0;background-color:#f0f2f5;">
        <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#f0f2f5;">
            <tr>
                <td align="center" style="padding:20px;">
                    <table role="presentation" style="max-width:640px;width:100%;border-collapse:collapse;border-spacing:0;text-align:left;background:#ffffff;box-shadow: 0 10px 40px -15px rgba(44,62,80,0.2);">
                        <!-- Header / Logo -->
                        <tr>
                            <td align="center" style="padding:40px 0;">
                                <a href="${siteUrl}" style="text-decoration:none;">
                                    <h1 style="font-size:36px;margin:0;font-family:'Lora',serif;color:#2c3e50;letter-spacing:-1px;">Fork & Fire</h1>
                                </a>
                            </td>
                        </tr>

                        <!-- VIBRANT HEADER IMAGE -->
                        <tr>
                             <td>
                                <a href="${siteUrl}/recipes">
                                    <img src="${heroImageUrl}" alt="Vibrant plate of food" width="640" style="display:block;width:100%;height:auto;"/>
                                </a>
                             </td>
                        </tr>

                        <!-- Main Content -->
                        <tr>
                            <td style="padding:40px;">
                                <!-- Personalized Greeting -->
                                <p style="font-size:18px;line-height:26px;color:#2c3e50;font-family:'Lora', serif; font-style: italic;">A note for ${recipientName},</p>
                                
                                <h2 style="font-size:28px;line-height:36px;font-family:'Lora',serif;color:#2c3e50;margin:15px 0 24px 0;">${subject}</h2>
                                
                                <!-- Injected HTML from TipTap Editor -->
                                <div class="user-content">
                                    ${htmlContent}
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Simple, elegant divider -->
                        <tr>
                            <td align="center" style="padding: 10px 40px;">
                                <table role="presentation" style="width:150px; border-top: 1px solid #e8e0d1;">
                                    <tr><td></td></tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Signature Section -->
                        <tr>
                            <td style="padding: 20px 40px 40px 40px;">
                                <p style="margin:0;font-size:16px;line-height:24px;color:#575757;">Happy cooking,</p>
                                <p style="font-family:'Brush Script MT','cursive';font-size:42px;line-height:48px;color:#e67e22;margin:0;">Sugata</p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding:30px;background:#2c3e50;">
                                <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-size:14px;">
                                    <tr>
                                        <td align="center">
                                            <p style="margin:0;font-family:'Montserrat',sans-serif;font-size:12px;line-height:1.6;color:#98a0a9;">
                                                © ${currentYear} Fork & Fire Kitchen. All Rights Reserved.<br/>
                                                You received this email because you subscribed to our journal.
                                                <a href="${unsubscribeUrl}" style="color:#98a0a9;">Unsubscribe</a>.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
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

module.exports = createNewsletterHtml;