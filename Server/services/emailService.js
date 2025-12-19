const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or 'outlook', 'yahoo', etc.
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASSWORD // App password (not regular password)
    }
});

// Send verification email
exports.sendVerificationEmail = async (userEmail, username, verificationToken) => {
    const verificationUrl = `http://localhost:3000/verify-email/${verificationToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'EdView - Verify Your Email Address',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
                <div style="background: white; padding: 30px; border-radius: 10px;">
                    <h1 style="color: #667eea; text-align: center; margin-bottom: 20px;">Welcome to EdView! 🎓</h1>

                    <p style="font-size: 16px; color: #333; line-height: 1.6;">
                        Hi <strong>${username}</strong>,
                    </p>

                    <p style="font-size: 16px; color: #333; line-height: 1.6;">
                        Thank you for signing up with EdView! To complete your registration and start exploring college reviews,
                        please verify your email address by clicking the button below:
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}"
                           style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                  color: white; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
                            Verify Email Address
                        </a>
                    </div>

                    <p style="font-size: 14px; color: #666; line-height: 1.6;">
                        Or copy and paste this link into your browser:
                    </p>
                    <p style="font-size: 14px; color: #667eea; word-break: break-all;">
                        ${verificationUrl}
                    </p>

                    <p style="font-size: 14px; color: #666; margin-top: 30px;">
                        This link will expire in <strong>24 hours</strong>.
                    </p>

                    <p style="font-size: 14px; color: #666;">
                        If you didn't create an account with EdView, please ignore this email.
                    </p>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

                    <p style="font-size: 12px; color: #999; text-align: center;">
                        © 2024 EdView - Your College Review Platform
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully to:', userEmail);
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
};

// Send welcome email after verification
exports.sendWelcomeEmail = async (userEmail, username) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Welcome to EdView! Your Account is Verified',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white;">
                    <h1 style="text-align: center; margin-bottom: 20px;">Welcome to EdView, ${username}! 🎉</h1>
                    <p style="font-size: 16px; text-align: center;">Your email has been verified successfully!</p>
                </div>

                <div style="padding: 30px; background: white; margin-top: 20px; border-radius: 10px; border: 2px solid #667eea;">
                    <h2 style="color: #667eea; margin-top: 0;">You can now:</h2>
                    <ul style="font-size: 16px; color: #333; line-height: 1.8;">
                        <li>📚 Browse college reviews from real students</li>
                        <li>✍️ Add your own review and share your experience</li>
                        <li>💬 Chat with our intelligent College Assistant</li>
                        <li>📊 Compare colleges side-by-side</li>
                        <li>🔍 Search and filter colleges by your preferences</li>
                    </ul>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:3000/signin"
                           style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                  color: white; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
                            Sign In Now
                        </a>
                    </div>
                </div>

                <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
                    © 2024 EdView - Your College Review Platform
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully to:', userEmail);
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return false;
    }
};
