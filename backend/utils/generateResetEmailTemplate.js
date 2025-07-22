/**
 * Creates a modern, elegant, and on-brand HTML email template for password resets.
 * It uses the original logic and function signature for 100% compatibility.
 * @param {string} resetUrl - The unique, secure URL for the password reset page.
 * @param {string} [userName="there"] - The first name of the user, with a fallback.
 * @returns {string} The complete, styled HTML email content.
 */
const resetPasswordEmailTemplate = (resetUrl, userName = "there") => {
    // === YOUR ORIGINAL LOGIC AND FUNCTIONS REMAIN UNTOUCHED ===
    const currentYear = new Date().getFullYear();
    const expiryTime = "5 minutes"; // Make sure this matches your backend controller's logic

    // === THE NEW, REDESIGNED HTML AND INLINE CSS ===
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,700;1,400&family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
        <style>
            body { margin:0; padding:0; background-color:#f7fafc; }
            table { border-collapse:collapse; }
            h1, h2, h3, p, a, span { font-family: 'Montserrat', sans-serif; }
            h1, h2, h3 { font-family: 'Lora', serif; color: #2c3e50; }
            a { color: #e67e22; text-decoration: underline; }
        </style>
    </head>
    <body style="background-color:#f7fafc;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td align="center" style="padding: 20px;">
                    <!-- Main Email Wrapper -->
                    <table style="width:100%; max-width:600px; background-color:#ffffff; border-radius:12px; box-shadow: 0 10px 40px -15px rgba(0,0,0,0.1);">
                        
                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding:30px; border-bottom: 1px solid #f0f2f5;">
                                <h1 style="font-size:28px; font-style:italic; margin:0;">Fork & Fire</h1>
                            </td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="padding:40px;">
                                <h2 style="font-size:24px; text-align:center;">Reset Your Password</h2>
                                <p style="font-size:16px; color:#575757; line-height:1.6; text-align:center; margin:16px 0 30px 0;">
                                    Hi ${userName},<br/>
                                    We received a request to reset the password for your account. No worries, we're here to help!
                                </p>
                                
                                <!-- Call to Action Button -->
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center">
                                            <a href="${resetUrl}" 
                                               style="background-color:#e67e22; color:#ffffff; font-family:'Montserrat', sans-serif; font-size:16px; font-weight:bold; text-decoration:none; padding:14px 28px; border-radius:8px; display:inline-block;">
                                                Reset Your Password
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                                <p style="margin:30px 0 0 0; text-align:center; font-size:14px; color:#718096;">
                                    This password reset link is valid for the next ${expiryTime}.
                                </p>

                                 <div style="height:1px; background-color:#f0f2f5; margin:30px 0;"></div>

                                 <p style="font-size:12px; color:#99a2ad; line-height:1.5; text-align:center;">
                                     If you didn't request a password reset, you can safely ignore this email. Only a person with access to your email can reset your password.
                                     <br/><br/>
                                     <strong>Having trouble?</strong> If the button above doesn't work, you can paste this link into your browser:<br/>
                                     <a href="${resetUrl}" style="color:#a0aec0; word-break:break-all;">${resetUrl}</a>
                                 </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding:20px 30px; text-align:center; background-color:#f7fafc; border-top:1px solid #e2e8f0;">
                                <p style="font-size:12px; color:#7A6C66;">
                                    © ${currentYear} Fork & Fire Kitchen. All Rights Reserved.
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

module.exports = resetPasswordEmailTemplate;