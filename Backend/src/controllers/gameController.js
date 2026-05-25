const Game = require('../models/gameModel');

// parseAppId: string appid ko normalized string format mein convert karta hai.
// Agar invalid value aaye toh null return karega.
const parseAppId = (value) => {
  const trimmed = String(value || '').trim();
  const n = parseInt(trimmed, 10);
  return Number.isNaN(n) ? null : String(n);
};

// appid string ke roop mein store aur compare karte hain.
const findAppIdQuery = (appid) => ({ appid });

// GET /api/v1/games
// Yahan se game list milta hai. search aur pagination optional hai.
const getGames = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
    const filter = {};

    // Agar search param hai toh name field mein match kare.
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };

    // archived parameter ko bhi support karte hain.
    if (req.query.archived === 'true' || req.query.archived === 'false') {
      filter.isArchived = req.query.archived === 'true';
    }

    const total = await Game.countDocuments(filter);
    const games = await Game.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ page, limit, total, count: games.length, games });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games', error: e.message });
  }
};

// GET /api/v1/games/:appid
// Ek specific game ko appid se laata hai.
const getGameByAppId = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOne(findAppIdQuery(appid));
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json(game);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching game', error: e.message });
  }
};

// POST /api/v1/games
// Naya game create karta hai.
const createGame = async (req, res) => {
  try {
    const { appid, name } = req.body;
    if (!appid || !name) return res.status(400).json({ message: 'appid and name are required' });

    const parsedAppId = parseAppId(appid);
    if (parsedAppId === null) return res.status(400).json({ message: 'Invalid appid' });

    const existing = await Game.findOne(findAppIdQuery(parsedAppId));
    if (existing) return res.status(409).json({ message: 'Game already exists' });

    const game = await Game.create({ ...req.body, appid: parsedAppId });
    res.status(201).json(game);
  } catch (e) {
    res.status(500).json({ message: 'Error creating game', error: e.message });
  }
};

// PUT /api/v1/games/:appid
// Game ko poori tarah replace karta hai. sare fields naya data se set ho jate hain.
const replaceGame = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOne(findAppIdQuery(appid));
    if (!game) return res.status(404).json({ message: 'Game not found' });

    await Game.updateOne(findAppIdQuery(appid), { ...req.body, appid }, { runValidators: true });
    const updated = await Game.findOne(findAppIdQuery(appid));
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: 'Error replacing game', error: e.message });
  }
};

// PATCH /api/v1/games/:appid
// Sirf woh fields update karta hai jo request body mein hain.
const updateGame = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOne(findAppIdQuery(appid));
    if (!game) return res.status(404).json({ message: 'Game not found' });

    const changes = { ...req.body };
    delete changes.appid; // appid change nahi kar sakte
    if (!Object.keys(changes).length) return res.status(400).json({ message: 'No update fields' });

    Object.assign(game, changes);
    game.history.push({ updatedAt: new Date(), changes });
    await game.save();

    res.json(game);
  } catch (e) {
    res.status(500).json({ message: 'Error updating game', error: e.message });
  }
};

// DELETE /api/v1/games/:appid
// Database se game ko hata deta hai.
const deleteGame = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOneAndDelete(findAppIdQuery(appid));
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json({ message: 'Game deleted', game });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting game', error: e.message });
  }
};

// GET /api/v1/games/exists/:appid
// Sirf check karega agar game exist karta hai ya nahi.
const checkGameExists = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const exists = await Game.exists(findAppIdQuery(appid));
    res.json({ exists: Boolean(exists) });
  } catch (e) {
    res.status(500).json({ message: 'Error checking game', error: e.message });
  }
};

// GET /api/v1/games/:appid/summary
// Summary laata hai, full game details nahi.
const getGameSummary = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name short_description developer publisher release_date price isArchived');
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json(game);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching summary', error: e.message });
  }
};

// GET /api/v1/games/:appid/history
// Game ki update history dikhata hai.
const getGameHistory = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name history');
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json({ appid: game.appid, name: game.name, history: game.history || [] });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching history', error: e.message });
  }
};

// PATCH /api/v1/games/:appid/archive
// Game ko archived flag true kar deta hai.
const archiveGame = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOneAndUpdate(findAppIdQuery(appid), { isArchived: true }, { new: true });
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json(game);
  } catch (e) {
    res.status(500).json({ message: 'Error archiving game', error: e.message });
  }
};

// PATCH /api/v1/games/:appid/restore
// Archived game ko wapas active karta hai.
const restoreGame = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOneAndUpdate(findAppIdQuery(appid), { isArchived: false }, { new: true });
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json(game);
  } catch (e) {
    res.status(500).json({ message: 'Error restoring game', error: e.message });
  }
};

// GET /api/v1/games/:appid/related
// Same genre wale related games laata hai.
const getRelatedGames = async (req, res) => {
  try {
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const game = await Game.findOne(findAppIdQuery(appid));
    if (!game) return res.status(404).json({ message: 'Game not found' });

    const related = await Game.find({ _id: { $ne: game._id }, genres: { $in: game.genres } })
      .limit(10)
      .select('appid name genres developer publisher');
    res.json({ related });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching related games', error: e.message });
  }
};

module.exports = {
  getGames,
  getGameByAppId,
  createGame,
  replaceGame,
  updateGame,
  deleteGame,
  checkGameExists,
  getGameSummary,
  getGameHistory,
  archiveGame,
  restoreGame,
  getRelatedGames,
};
