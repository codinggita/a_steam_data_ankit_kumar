const express = require('express');
const jwtController = require('../controllers/jwtController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes for JWT utility
router.post('/generate-token', jwtController.generateToken);
router.post('/verify-token', jwtController.verifyToken);
router.post('/refresh-token', jwtController.refreshToken);
router.delete('/revoke-token', jwtController.revokeToken);

// Protected routes using JWT auth middleware
router.get('/profile', protect, jwtController.getProfile);
router.get('/dashboard', protect, jwtController.getDashboard);
router.get('/private-games', protect, jwtController.getPrivateGames);
router.get('/private-analytics', protect, jwtController.getPrivateAnalytics);

module.exports = router;
