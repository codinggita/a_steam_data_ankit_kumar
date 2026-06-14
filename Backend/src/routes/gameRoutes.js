const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Game endpoints mapped from route-rule.md
router.route('/')
  .get(gameController.getGames)
  .post(gameController.createNewGame);

router.get('/exists/:appid', gameController.checkExists);
router.get('/:appid/summary', gameController.getSummary);
router.get('/:appid/history', gameController.getGameHistory);
router.patch('/:appid/archive', gameController.archiveGame);
router.patch('/:appid/restore', gameController.restoreGame);

router.route('/:appid')
  .get(gameController.getGameDetails)
  .put(gameController.replaceGameDetails)
  .patch(gameController.updateGameDetails)
  .delete(gameController.deleteGame);

module.exports = router;
