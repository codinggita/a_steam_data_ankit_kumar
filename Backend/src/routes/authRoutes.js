const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');
const { validateRegister, validateLogin } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Public auth routes (with rate limiters and validations)
router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/logout', authController.logout);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-email', authController.verifyEmail);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.patch('/profile', protect, authController.updateProfile);
router.post('/change-password', protect, authController.changePassword);

module.exports = router;
