const user = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// reCAPTCHA secret key - Get your own key from https://www.google.com/recaptcha/admin
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'; // Test secret key

// Function to verify reCAPTCHA token
const verifyCaptcha = async (token) => {
    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`
        );
        return response.data.success;
    } catch (error) {
        console.error('Error verifying captcha:', error.message);
        return false;
    }
};

exports.regesterUser = async (req, res) => {
    try {
        const newUser = req.body;
        const takenUserEmail = await user.findOne({ email: newUser.email });
        const takenUserUsername = await user.findOne({ username: newUser.username });
        if (takenUserEmail || takenUserUsername) {
            return res.status(403).send({ message: 'Username or email is already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newUser.password, salt);

        const dbuser = new user({
            username: newUser.username.toLowerCase(),
            email: newUser.email.toLowerCase(),
            password: hashedPassword,
            isVerified: true,
            verificationToken: null,
            verificationTokenExpires: null
        });

        await dbuser.save();

        return res.status(201).send({
            message: 'Registration successful! You can now sign in.',
            email: dbuser.email
        });
    } catch (error) {
        console.log(error.message);
        return res.status(400).send({ message: 'Error registering new user!' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const loggingInUser = req.body; // Use this variable instead

        // Verify reCAPTCHA token
        const captchaToken = loggingInUser.captchaToken;
        if (!captchaToken) {
            return res.status(400).send({ message: 'Captcha verification required!' });
        }

        const isCaptchaValid = await verifyCaptcha(captchaToken);
        if (!isCaptchaValid) {
            return res.status(400).send({ message: 'Captcha verification failed! Please try again.' });
        }

        const existingUser = await user.findOne({ username: loggingInUser.username });
        if (!existingUser) {
            return res.status(404).send({ message: 'Invalid username or password!' });
        }

        // Change userLoggingIn to loggingInUser
        const isPasswordCorrect = await bcrypt.compare(loggingInUser.password, existingUser.password);
        if (isPasswordCorrect) {
        const payload = {
            id: existingUser._id,
            username: existingUser.username,
        };
            jwt.sign(
                payload,
                "my_secret_key_but_it_is_not_secure", // Remember to change this key in production
                { expiresIn: '2h' }, // Use a more reasonable expiration time
                (error, token) => {
                    if (error) {
                        return res.status(400).send({ message: 'Error generating token!' });
                    }
                    return res.status(200).send({
                        message: 'Logged in successfully',
                        token: "Bearer " + token // Added space after "Bearer"
                    });
                }
            );
        } else {
            return res.status(401).send({ message: 'Invalid username or password!' });
        }
    } catch (error) {
        console.error('Error during login:', error.message);
        return res.status(500).send({ message: 'An error occurred during login. Please try again.' });
    }
};

// Verify email with token
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const existingUser = await user.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!existingUser) {
            return res.status(400).send({
                message: 'Verification link is invalid or has expired. Please request a new verification email.'
            });
        }

        // Update user as verified
        existingUser.isVerified = true;
        existingUser.verificationToken = null;
        existingUser.verificationTokenExpires = null;
        await existingUser.save();

        // Send welcome email
        await emailService.sendWelcomeEmail(existingUser.email, existingUser.username);

        return res.status(200).send({
            message: 'Email verified successfully! You can now sign in.',
            verified: true
        });
    } catch (error) {
        console.error('Error verifying email:', error.message);
        return res.status(500).send({ message: 'Error verifying email. Please try again.' });
    }
};

// Resend verification email
exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await user.findOne({ email: email.toLowerCase() });

        if (!existingUser) {
            return res.status(404).send({ message: 'No account found with this email address.' });
        }

        if (existingUser.isVerified) {
            return res.status(400).send({ message: 'This account is already verified. You can sign in.' });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        existingUser.verificationToken = verificationToken;
        existingUser.verificationTokenExpires = tokenExpiry;
        await existingUser.save();

        // Send new verification email
        const emailSent = await emailService.sendVerificationEmail(
            existingUser.email,
            existingUser.username,
            verificationToken
        );

        if (emailSent) {
            return res.status(200).send({
                message: 'Verification email sent! Please check your inbox.',
                email: existingUser.email
            });
        } else {
            return res.status(500).send({
                message: 'Failed to send verification email. Please try again later.'
            });
        }
    } catch (error) {
        console.error('Error resending verification:', error.message);
        return res.status(500).send({ message: 'Error resending verification email. Please try again.' });
    }
};
