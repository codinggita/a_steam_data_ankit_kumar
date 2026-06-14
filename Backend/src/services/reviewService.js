const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const gameService = require('./gameService');

/**
 * Helper to ensure at least one mock user exists in the DB for testing reviews
 * @returns {Promise<string>} - User ObjectId string
 */
const getOrCreateTestUser = async () => {
  let user = await User.findOne({ email: 'testuser@gmail.com' });
  if (!user) {
    user = await User.create({
      username: 'testuser',
      email: 'testuser@gmail.com',
      password: 'password123', // Will be hashed by userSchema pre-save hook
      role: 'user',
      isVerified: true
    });
  }
  return user._id;
};

/**
 * Fetch user reviews for a game
 * @param {string} appid - Game App ID
 * @returns {Promise<Array>} - Reviews list populated with user details
 */
const getReviewsByAppid = async (appid) => {
  return await Review.find({ appid })
    .populate('userId', 'username email')
    .lean();
};

/**
 * Add a user review
 * @param {string} appid - Game App ID
 * @param {Object} reviewData - Review inputs
 * @returns {Promise<Object>} - Created review document
 */
const createReview = async (appid, reviewData) => {
  // Verify game exists
  const gameExists = await gameService.checkGameExists(appid);
  if (!gameExists) {
    const error = new Error(`Game with App ID ${appid} not found`);
    error.status = 404;
    throw error;
  }

  // Resolve user
  let userId = reviewData.userId;
  if (!userId) {
    userId = await getOrCreateTestUser();
  }

  // Generate unique review ID
  const reviewId = `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const review = await Review.create({
    appid,
    userId,
    reviewId,
    rating: Number(reviewData.rating),
    reviewText: reviewData.reviewText
  });

  return await review.populate('userId', 'username email');
};

/**
 * Update a user review
 * @param {string} reviewId - Review ID
 * @param {Object} updateData - Update inputs
 * @returns {Promise<Object>} - Updated review document
 */
const updateReviewByReviewId = async (reviewId, updateData) => {
  const fields = {};
  if (updateData.rating !== undefined) fields.rating = Number(updateData.rating);
  if (updateData.reviewText !== undefined) fields.reviewText = updateData.reviewText;

  const review = await Review.findOneAndUpdate(
    { reviewId },
    { $set: fields },
    { new: true, runValidators: true }
  ).populate('userId', 'username email');

  return review;
};

/**
 * Delete a user review
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object>} - Deleted review document
 */
const deleteReviewByReviewId = async (reviewId) => {
  return await Review.findOneAndDelete({ reviewId }).populate('userId', 'username email');
};

module.exports = {
  getReviewsByAppid,
  createReview,
  updateReviewByReviewId,
  deleteReviewByReviewId
};
