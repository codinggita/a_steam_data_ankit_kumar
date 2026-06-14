const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { testLimiter } = require('../middlewares/rateLimitMiddleware');

const router = express.Router();

/**
 * GET /api/v1/middleware/logger
 * Demonstrates request logging. The request logger is mounted globally,
 * so it logs this request automatically.
 */
router.get('/logger', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Request logger middleware executed. Check the server console logs for details.',
    loggedAt: new Date()
  });
});

/**
 * GET /api/v1/middleware/auth
 * Demonstrates auth check. Uses the protect middleware.
 */
router.get('/auth', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication check passed. User is authorized.',
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

/**
 * GET /api/v1/middleware/rate-limit
 * Demonstrates rate limiting. Uses the testLimiter (max 3 requests/min).
 */
router.get('/rate-limit', testLimiter, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Rate limiting check passed. You have not exceeded your limit of 3 requests per minute.'
  });
});

/**
 * GET /api/v1/middleware/error-handler
 * Demonstrates global error handling by throwing a test error.
 */
router.get('/error-handler', (req, res, next) => {
  // We explicitly throw an error to trigger the global error handler middleware
  const testError = new Error('Test Error: This error was explicitly thrown to test the global error handling middleware.');
  testError.status = 400;
  next(testError);
});

module.exports = router;
