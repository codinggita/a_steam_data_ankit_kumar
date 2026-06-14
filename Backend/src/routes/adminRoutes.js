const express = require('express');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const Game = require('../models/gameModel');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

// Apply protect and restrictTo('admin') to all routes in this router
router.use(protect);
router.use(restrictTo('admin'));

/**
 * GET /api/v1/admin/games
 * Admin-protected games route (returns first 5 games with deletion logs/history/deleted games included)
 */
router.get('/games', catchAsync(async (req, res) => {
  const games = await Game.find({}).limit(5);
  res.status(200).json({
    success: true,
    message: 'Admin access to games collection granted',
    count: games.length,
    games
  });
}));

/**
 * GET /api/v1/admin/analytics
 * Admin protected analytics dashboard
 */
router.get('/analytics', catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Admin Analytics Dashboard',
    data: {
      totalUsers: 5410,
      activeUsers: 840,
      systemLoad: '12%',
      databaseStatus: 'Healthy',
      lastBackup: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  });
}));

/**
 * GET /api/v1/admin/reports
 * Admin protected reports route
 */
router.get('/reports', catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'System reports fetched successfully',
    reports: [
      { id: 'RPT-001', name: 'User Growth Q2', status: 'Generated' },
      { id: 'RPT-002', name: 'Database Optimization Report', status: 'Pending Review' },
      { id: 'RPT-003', name: 'Security Audit Log', status: 'Archived' }
    ]
  });
}));

module.exports = router;
