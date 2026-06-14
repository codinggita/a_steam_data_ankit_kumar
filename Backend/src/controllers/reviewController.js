const reviewService = require('../services/reviewService');
const catchAsync = require('../utils/catchAsync');

// Fetch user reviews for a game
const getReviews = catchAsync(async (req, res) => {
  const { appid } = req.params;
  const reviews = await reviewService.getReviewsByAppid(appid);

  res.status(200).json({
    success: true,
    message: 'Reviews retrieved successfully',
    data: reviews
  });
});

// Add a user review
const addReview = catchAsync(async (req, res) => {
  const { appid } = req.params;
  const { rating, reviewText } = req.body;

  // Input validation
  if (rating === undefined || !reviewText) {
    return res.status(400).json({
      success: false,
      message: 'Rating and reviewText are required fields'
    });
  }

  const ratingNum = Number(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be a number between 1 and 10'
    });
  }

  const review = await reviewService.createReview(appid, req.body);

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: review
  });
});

// Update user review
const updateReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const { rating } = req.body;

  if (rating !== undefined) {
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 10'
      });
    }
  }

  const review = await reviewService.updateReviewByReviewId(reviewId, req.body);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: `Review with ID ${reviewId} not found`
    });
  }

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: review
  });
});

// Delete user review
const deleteReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const review = await reviewService.deleteReviewByReviewId(reviewId);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: `Review with ID ${reviewId} not found`
    });
  }

  res.status(200).json({
    success: true,
    message: `Review with ID ${reviewId} deleted successfully`,
    data: review
  });
});

module.exports = {
  getReviews,
  addReview,
  updateReview,
  deleteReview
};
