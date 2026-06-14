const subresourceService = require('../services/subresourceService');
const gameService = require('../services/gameService');
const catchAsync = require('../utils/catchAsync');

// Helper to validate game exists before returning sub-resource
const validateGame = async (appid) => {
  const game = await gameService.getGameByAppid(appid);
  if (!game) {
    const error = new Error(`Game with App ID ${appid} not found`);
    error.status = 404;
    throw error;
  }
  return game;
};

// Fetch screenshots of a game
const getScreenshots = catchAsync(async (req, res) => {
  const { appid } = req.params;
  await validateGame(appid);

  const data = subresourceService.getScreenshots(appid);
  res.status(200).json({
    success: true,
    message: 'Screenshots retrieved successfully',
    data
  });
});

// Fetch trailers and gameplay videos
const getTrailers = catchAsync(async (req, res) => {
  const { appid } = req.params;
  const game = await validateGame(appid);

  const data = subresourceService.getTrailers(appid, game.name);
  res.status(200).json({
    success: true,
    message: 'Trailers and gameplay videos retrieved successfully',
    data
  });
});

// Fetch system requirements
const getSystemRequirements = catchAsync(async (req, res) => {
  const { appid } = req.params;
  await validateGame(appid);

  const data = subresourceService.getSystemRequirements(appid);
  res.status(200).json({
    success: true,
    message: 'System requirements retrieved successfully',
    data
  });
});

// Fetch downloadable content list
const getDlc = catchAsync(async (req, res) => {
  const { appid } = req.params;
  const game = await validateGame(appid);

  const data = subresourceService.getDlcList(appid, game.name);
  res.status(200).json({
    success: true,
    message: 'Downloadable content list retrieved successfully',
    data
  });
});

// Fetch achievements
const getAchievements = catchAsync(async (req, res) => {
  const { appid } = req.params;
  await validateGame(appid);

  const data = subresourceService.getAchievements(appid);
  res.status(200).json({
    success: true,
    message: 'Achievements retrieved successfully',
    data
  });
});

// Fetch leaderboard rankings
const getLeaderboards = catchAsync(async (req, res) => {
  const { appid } = req.params;
  await validateGame(appid);

  const data = subresourceService.getLeaderboards(appid);
  res.status(200).json({
    success: true,
    message: 'Leaderboard rankings retrieved successfully',
    data
  });
});

// Fetch latest game updates
const getUpdates = catchAsync(async (req, res) => {
  const { appid } = req.params;
  await validateGame(appid);

  const data = subresourceService.getUpdates(appid);
  res.status(200).json({
    success: true,
    message: 'Latest game updates retrieved successfully',
    data
  });
});

// Fetch game related news
const getNews = catchAsync(async (req, res) => {
  const { appid } = req.params;
  const game = await validateGame(appid);

  const data = subresourceService.getNewsList(appid, game.name);
  res.status(200).json({
    success: true,
    message: 'Game related news retrieved successfully',
    data
  });
});

// Fetch related game recommendations
const getRelated = catchAsync(async (req, res) => {
  const { appid } = req.params;
  // Live recommendation lookup
  const data = await subresourceService.getRelatedGames(appid);
  
  if (data === null) {
    return res.status(404).json({
      success: false,
      message: `Game with App ID ${appid} not found`
    });
  }

  res.status(200).json({
    success: true,
    message: 'Related game recommendations retrieved successfully',
    data
  });
});

module.exports = {
  getScreenshots,
  getTrailers,
  getSystemRequirements,
  getDlc,
  getAchievements,
  getLeaderboards,
  getUpdates,
  getNews,
  getRelated
};
