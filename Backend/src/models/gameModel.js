const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  updatedAt: {
    type: Date,
    default: Date.now
  },
  action: {
    type: String,
    required: true
  },
  changes: {
    type: mongoose.Schema.Types.Map,
    of: String
  }
}, { _id: false });

const gameSchema = new mongoose.Schema({
  appid: {
    type: String,
    required: [true, 'App ID is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Game name is required'],
    trim: true
  },
  release_year: {
    type: String,
    trim: true
  },
  release_date: {
    type: String,
    trim: true
  },
  genres: {
    type: String,
    trim: true
  },
  categories: {
    type: String,
    trim: true
  },
  price: {
    type: String,
    default: '0.00',
    trim: true
  },
  recommendations: {
    type: String,
    default: '0',
    trim: true
  },
  developer: {
    type: String,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  history: [HistorySchema]
}, {
  timestamps: true,
  collection: 'Games' // Explicitly maps to the 'Games' collection in the Steam DB
});

// Indexes for common queries
gameSchema.index({ name: 'text', genres: 'text', developer: 'text', publisher: 'text' }); // Text index for full-text search

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
