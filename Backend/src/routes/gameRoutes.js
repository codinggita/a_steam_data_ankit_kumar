const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const subresourceController = require('../controllers/subresourceController');

// Game endpoints mapped from route-rule.md
router.route('/')
  .get(gameController.getGames)
  .post(gameController.createNewGame);

router.get('/exists/:appid', gameController.checkExists);
router.get('/:appid/summary', gameController.getSummary);
router.get('/:appid/history', gameController.getGameHistory);
router.patch('/:appid/archive', gameController.archiveGame);
router.patch('/:appid/restore', gameController.restoreGame);

// Game sub-resources (mock and related recommendation routes)
router.get('/:appid/screenshots', subresourceController.getScreenshots);
router.get('/:appid/trailers', subresourceController.getTrailers);
router.get('/:appid/system-requirements', subresourceController.getSystemRequirements);
router.get('/:appid/dlc', subresourceController.getDlc);
router.get('/:appid/achievements', subresourceController.getAchievements);
router.get('/:appid/leaderboards', subresourceController.getLeaderboards);
router.get('/:appid/updates', subresourceController.getUpdates);
router.get('/:appid/news', subresourceController.getNews);
router.get('/:appid/related', subresourceController.getRelated);

router.route('/:appid')
  .get(gameController.getGameDetails)
  .put(gameController.replaceGameDetails)
  .patch(gameController.updateGameDetails)
  .delete(gameController.deleteGame);

module.exports = router;
