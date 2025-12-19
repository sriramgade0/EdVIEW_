const express = require('express');
const authController= require('../controllers/auth');
const authRouter = express.Router();


authRouter.post('/register',authController.regesterUser);

authRouter.post('/login',authController.loginUser);

authRouter.get('/verify-email/:token',authController.verifyEmail);

authRouter.post('/resend-verification',authController.resendVerification);

module.exports = authRouter