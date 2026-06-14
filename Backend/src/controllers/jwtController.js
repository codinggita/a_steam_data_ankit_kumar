const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Game = require('../models/gameModel');
const catchAsync = require('../utils/catchAsync');
const { revokedTokens, protect } = require('../middlewares/authMiddleware');

// Helper to generate a token
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d'
  });
};

/**
 * Generate a JWT token for a user (or default user if none provided)
 * POST /api/v1/jwt/generate-token
 */
const generateToken = catchAsync(async (req, res) => {
  let { userId } = req.body;
  let user;

  if (userId) {
    user = await User.findById(userId);
  }

  // Fallback: Find any existing user or create a default test user
  if (!user) {
    user = await User.findOne({ email: 'jwt_test_user@example.com' });
    if (!user) {
      user = await User.create({
        username: 'jwt_test_user',
        email: 'jwt_test_user@example.com',
        password: 'password123',
        role: 'user'
      });
    }
  }

  const token = signToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Token generated successfully',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

/**
 * Verify a JWT token
 * POST /api/v1/jwt/verify-token
 */
const verifyToken = catchAsync(async (req, res) => {
  let token = req.body.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is required for verification'
    });
  }

  if (revokedTokens.has(token)) {
    return res.status(401).json({
      success: false,
      message: 'Token has been revoked'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User belonging to this token not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      decoded,
      user
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: err.message
    });
  }
});

/**
 * Refresh a JWT access token
 * POST /api/v1/jwt/refresh-token
 */
const refreshToken = catchAsync(async (req, res) => {
  let token = req.body.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is required to refresh'
    });
  }

  if (revokedTokens.has(token)) {
    return res.status(401).json({
      success: false,
      message: 'Cannot refresh a revoked token'
    });
  }

  try {
    // Decode without checking expiry to allow refreshing expired tokens, or let jwt.verify handle it
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newToken = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Invalid token payload',
      error: err.message
    });
  }
});

/**
 * Revoke/Blacklist a JWT token
 * DELETE /api/v1/jwt/revoke-token
 */
const revokeToken = catchAsync(async (req, res) => {
  let token = req.body.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is required to revoke'
    });
  }

  revokedTokens.add(token);

  res.status(200).json({
    success: true,
    message: 'Token has been successfully revoked and blacklisted'
  });
});

/**
 * Get JWT protected profile details
 * GET /api/v1/jwt/profile
 */
const getProfile = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authenticated profile access granted',
    user: req.user
  });
});

/**
 * Get JWT protected dashboard details
 * GET /api/v1/jwt/dashboard
 */
const getDashboard = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the JWT protected dashboard!',
    timestamp: new Date(),
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

/**
 * Get private games
 * GET /api/v1/jwt/private-games
 */
const getPrivateGames = catchAsync(async (req, res) => {
  // Retrieve 3 private/exclusive games from database
  const games = await Game.find({ isDeleted: { $ne: true } }).limit(3);

  res.status(200).json({
    success: true,
    message: 'Private games list retrieved successfully',
    games
  });
});

/**
 * Get private analytics
 * GET /api/v1/jwt/private-analytics
 */
const getPrivateAnalytics = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Private analytics metrics retrieved successfully',
    data: {
      activeSessions: 42,
      totalDownloads: 12540,
      monthlyRevenue: '$25,480.00',
      retentionRate: '88.5%'
    }
  });
});

module.exports = {
  generateToken,
  verifyToken,
  refreshToken,
  revokeToken,
  getProfile,
  getDashboard,
  getPrivateGames,
  getPrivateAnalytics
};
