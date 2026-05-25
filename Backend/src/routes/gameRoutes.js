const express = require('express');
const router = express.Router();
const controller = require('../controllers/gameController');

// GET /api/v1/games
// Saare games list karne ke liye route.
router.get('/', controller.getGames);

// GET /api/v1/games/exists/:appid
// Sirf check karega agar game exist karta hai ya nahi.
router.get('/exists/:appid', controller.checkGameExists);

// GET /api/v1/games/:appid/summary
// Game ka short summary dene ke liye.
router.get('/:appid/summary', controller.getGameSummary);

// GET /api/v1/games/:appid/history
// Game ki update history laane ke liye.
router.get('/:appid/history', controller.getGameHistory);

// GET /api/v1/games/:appid/related
// Related game recommendations dikhata hai.
router.get('/:appid/related', controller.getRelatedGames);

// GET /api/v1/games/:appid
// Specific game details laane ka route.
router.get('/:appid', controller.getGameByAppId);

// POST /api/v1/games
// Naya game create karne ka route.
router.post('/', controller.createGame);

// PUT /api/v1/games/:appid
// Poore game record ko replace karne ka route.
router.put('/:appid', controller.replaceGame);

// PATCH /api/v1/games/:appid/archive
// Game ko archive karne ka route.
router.patch('/:appid/archive', controller.archiveGame);

// PATCH /api/v1/games/:appid/restore
// Archive game ko restore karne ka route.
router.patch('/:appid/restore', controller.restoreGame);

// PATCH /api/v1/games/:appid
// Game ke kuch fields update karne ka route.
router.patch('/:appid', controller.updateGame);

// DELETE /api/v1/games/:appid
// Game delete karne ka route.
router.delete('/:appid', controller.deleteGame);

module.exports = router;
