/**
 * Custom request body validation middlewares
 */

// Simple email format regex validation
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

/**
 * Validate user registration data
 */
const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Username is required and cannot be empty'
    });
  }

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password is required and must be at least 6 characters long'
    });
  }

  next();
};

/**
 * Validate user login credentials
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address for login'
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required for login'
    });
  }

  next();
};

/**
 * Validate game creation payload (POST)
 */
const validateGameCreate = (req, res, next) => {
  const { appid, name, price, recommendations, release_date } = req.body;

  if (!appid || !String(appid).trim()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: App ID (appid) is a required field'
    });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Game Name (name) is a required field'
    });
  }

  // Price validation
  if (price !== undefined) {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Price must be a non-negative numeric string or value'
      });
    }
  }

  // Recommendations rating validation
  if (recommendations !== undefined) {
    const recNum = parseInt(recommendations, 10);
    if (isNaN(recNum) || recNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Recommendations must be a non-negative integer string or value'
      });
    }
  }

  // Release date simple formatting check (e.g. 'MMM D, YYYY')
  if (release_date) {
    if (typeof release_date !== 'string' || release_date.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Release date must be a valid date string (e.g. "Jul 5, 2024")'
      });
    }
  }

  next();
};

/**
 * Validate game partial update payload (PATCH)
 */
const validateGameUpdate = (req, res, next) => {
  const { price, recommendations, release_date } = req.body;

  // Price validation
  if (price !== undefined) {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Price must be a non-negative numeric string or value'
      });
    }
  }

  // Recommendations rating validation
  if (recommendations !== undefined) {
    const recNum = parseInt(recommendations, 10);
    if (isNaN(recNum) || recNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Recommendations must be a non-negative integer string or value'
      });
    }
  }

  // Release date formatting check
  if (release_date) {
    if (typeof release_date !== 'string' || release_date.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Release date must be a valid date string (e.g. "Jul 5, 2024")'
      });
    }
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateGameCreate,
  validateGameUpdate
};
