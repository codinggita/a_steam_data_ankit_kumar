const rateLimit = require('express-rate-limit');

// General API rate limiter: max 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for authentication routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 registration/login requests per windowMs
  message: {
    success: false,
    message: 'Too many login/register attempts. Please try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Test rate limiter for middleware check endpoint: max 3 requests per minute
const testLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Rate limit exceeded for test endpoint. Max 3 requests per minute allowed.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  authLimiter,
  testLimiter
};
