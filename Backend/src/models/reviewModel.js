const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  appid: {
    type: String,
    required: [true, 'App ID is required'],
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  reviewId: {
    type: String,
    required: [true, 'Review ID is required'],
    unique: true,
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot exceed 10']
  },
  reviewText: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true
  }
}, {
  timestamps: true
});

// Index to quickly query all reviews for a game
reviewSchema.index({ appid: 1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
