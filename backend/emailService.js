const nodemailer = require('nodemailer');

// Use environment variables for SMTP, fallback to logging
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let transporter = null;

if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort == 465, 
        auth: {
            user: smtpUser,
            pass: smtpPass
        }
    });
} else {
    console.warn("SMTP credentials not provided in .env. Emails will be logged to console instead of sent.");
}

const generateWelcomeEmailHtml = (name, email, password) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
            font-family: 'Google Sans', Roboto, Helvetica, Arial, sans-serif;
            color: #202124;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            border: 1px solid #dadce0;
            overflow: hidden;
        }
        .header {
            padding: 32px 40px 0;
            text-align: center;
        }
        .header h1 {
            font-size: 24px;
            font-weight: 400;
            margin: 0;
            color: #202124;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1a73e8;
            margin-bottom: 16px;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 24px 40px 40px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 24px;
        }
        .credentials-box {
            background-color: #f8f9fa;
            border: 1px solid #dadce0;
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 32px;
        }
        .credential-item {
            margin-bottom: 16px;
        }
        .credential-item:last-child {
            margin-bottom: 0;
        }
        .credential-label {
            font-size: 12px;
            font-weight: 500;
            color: #5f6368;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .credential-value {
            font-size: 16px;
            color: #202124;
            font-family: monospace;
            background: #fff;
            padding: 8px 12px;
            border: 1px solid #e8eaed;
            border-radius: 4px;
            display: block;
        }
        .button-container {
            text-align: center;
        }
        .btn {
            background-color: #1a73e8;
            color: #ffffff;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            padding: 10px 24px;
            border-radius: 4px;
            display: inline-block;
        }
        .btn:hover {
            background-color: #1557b0;
        }
        .footer {
            padding: 24px 40px;
            text-align: center;
            font-size: 12px;
            color: #5f6368;
            border-top: 1px solid #dadce0;
            background-color: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Helvica Connect</div>
            <h1>Welcome to the team</h1>
        </div>
        <div class="content">
            <div class="greeting">Hi ${name},</div>
            <div style="font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
                An administrator has created a new agent account for you on Helvica Connect. Please use the credentials below to log in and start assisting customers.
            </div>
            
            <div class="credentials-box">
                <div class="credential-item">
                    <div class="credential-label">Email Address (Username)</div>
                    <div class="credential-value">${email}</div>
                </div>
                <div class="credential-item">
                    <div class="credential-label">Temporary Password</div>
                    <div class="credential-value">${password}</div>
                </div>
            </div>

            <div class="button-container">
                <a href="http://localhost:5173" class="btn">Log in to Dashboard</a>
            </div>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} Helvica Connect. All rights reserved.<br>
            Please do not reply to this email.
        </div>
    </div>
</body>
</html>
    `;
};

const sendWelcomeEmail = async (name, email, password) => {
    const htmlContent = generateWelcomeEmailHtml(name, email, password);
    const subject = "Welcome to Helvica Connect - Your Login Credentials";

    if (transporter) {
        try {
            await transporter.sendMail({
                from: `"Helvica Connect" <${process.env.SMTP_FROM || 'no-reply@helvicaconnect.com'}>`,
                to: email,
                subject: subject,
                html: htmlContent
            });
            console.log(`Welcome email sent to ${email}`);
        } catch (error) {
            console.error("Failed to send welcome email:", error);
        }
    } else {
        // Fallback for development if SMTP is not configured
        console.log("---------------------------------------------------------");
        console.log(`[EMAIL MOCK] To: ${email} | Subject: ${subject}`);
        console.log(`[EMAIL MOCK] Content:\n${htmlContent}`);
        console.log("---------------------------------------------------------");
    }
};

module.exports = {
    sendWelcomeEmail,
    generateWelcomeEmailHtml
};
