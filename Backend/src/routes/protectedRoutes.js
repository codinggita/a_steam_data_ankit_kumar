const express = require('express');
const gameController = require('../controllers/gameController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes in this router
router.use(protect);

// Protected routes to manage games
router.post('/games', gameController.createNewGame);
router.patch('/games/:appid', gameController.updateGameDetails);
router.delete('/games/:appid', gameController.deleteGame);

module.exports = router;
