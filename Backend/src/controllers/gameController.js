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

// ==================== GAME INFORMATION ROUTES ====================
// Ye section game ke screenshots, trailers, reviews, achievements aur dusri cheezein
// Handle karta hai - basically game ke details ka sab information

// GET /api/v1/games/:appid/screenshots
// Game ke images (screenshots) ko data se nikaal kar bhejta hai
// Images ek list ke andar save hote hain
// Wapas mein game ki ID, naam aur images ki list milti hai
const getScreenshots = async (req, res) => {
  try {
    // URL se game ki ID nikaal kar use karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Data se game ko dhund kar usci images nikaalte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name screenshots');
    
    // Agar game nahi mila toh error bhejte hain
    if (!game) return res.status(404).json({ message: 'Game not found' });
    
    // Images ki list return karte hain
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      screenshots: game.screenshots || [] 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching screenshots', error: e.message });
  }
};

// GET /api/v1/games/:appid/trailers
// Game ke videos (trailers) ko data se nikaal kar bhejta hai
// Videos ek list mein store hote hain
// Wapas mein game ka naam aur videos ki list milti hai
const getTrailers = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Game ke videos ko data se dhundhte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name trailers');
    
    // Agar game nahi hai toh error message bhejte hain
    if (!game) return res.status(404).json({ message: 'Game not found' });
    
    // Videos ki list return karte hain (ya empty list agar video nahi hai)
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      trailers: game.trailers || [] 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching trailers', error: e.message });
  }
};

// GET /api/v1/games/:appid/reviews
// Game ke user reviews (jo log likhe the) sabko bhejta hai
// Reviews ek list mein store hote hain
// Chahte to URL mein limit de kar sirf kuch reviews likha kar sakte ho
// Example: /api/v1/games/123/reviews?limit=10 (sirf 10 reviews dikhega)
const getReviews = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Game ke reviews ko data se dhundhte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name reviews');
    
    // Agar game nahi hai toh error
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // URL se limit nikaalte hain (kitne reviews dikhane hain, default 20)
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
    
    // Reviews ko slice karke sirf limit number tak dikhate hain
    const reviews = (game.reviews || []).slice(0, limit);
    
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      totalReviews: (game.reviews || []).length,
      reviews 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching reviews', error: e.message });
  }
};

// POST /api/v1/games/:appid/reviews
// Naya review add karta hai (user apna feedback likhe)
// Request mein: userId (kaun likha), rating (1-5), reviewText (kya likha)
// Example:
// {
//   "userId": "user123",
//   "rating": 5,
//   "reviewText": "Bilkul asaan game!"
// }
const addReview = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Request se data nikaalte hain
    const { userId, rating, reviewText } = req.body;
    
    // Check karte hain ki sab data mile hai ya nahi
    if (!userId || !rating || !reviewText) {
      return res.status(400).json({ message: 'userId, rating, and reviewText are required' });
    }

    // Rating ko check karte hain (1 se 5 ke beech hona chahiye)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Game ko data se find karte hain
    const game = await Game.findOne(findAppIdQuery(appid));
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Naya review object banate hain (date/time ke saath)
    const newReview = {
      userId,
      rating,
      reviewText,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Reviews list ko check karte hain aur naya review add karte hain
    if (!game.reviews) game.reviews = [];
    game.reviews.push(newReview);

    // Game ko save karte hain
    await game.save();

    // Success message de kar naya review return karte hain
    res.status(201).json({ 
      message: 'Review add hogaya', 
      review: newReview 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error adding review', error: e.message });
  }
};

// PATCH /api/v1/games/:appid/reviews/:reviewId
// Purana review ko badal deta hai (update karta hai)
// Request mein sirf wo data de jo badlana ho
// Example: {"rating": 4} - sirf rating badlega
const updateReview = async (req, res) => {
  try {
    // URL se game ID aur review ID nikaalte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const { reviewId } = req.params;
    if (!reviewId) return res.status(400).json({ message: 'Review ID required hai' });

    // Game ko data se find karte hain
    const game = await Game.findOne(findAppIdQuery(appid));
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Reviews list mein se specific review ko dhundhte hain
    const review = game.reviews?.find(r => r._id?.toString() === reviewId);
    if (!review) return res.status(404).json({ message: 'Review nahi mila' });

    // Request se jo data mile wo update karte hain
    // Rating ko check karte hain pehle
    if (req.body.rating !== undefined) {
      if (req.body.rating < 1 || req.body.rating > 5) {
        return res.status(400).json({ message: 'Rating 1 se 5 ke beech hona chahiye' });
      }
      review.rating = req.body.rating;
    }

    // Review text ko update karte hain agar diya ho
    if (req.body.reviewText) review.reviewText = req.body.reviewText;

    // Update ka time set karte hain
    review.updatedAt = new Date();

    // Game ko save karte hain
    await game.save();

    // Updated review return karte hain
    res.json({ 
      message: 'Review update ho gaya', 
      review 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error updating review', error: e.message });
  }
};

// DELETE /api/v1/games/:appid/reviews/:reviewId
// Review ko delete karta hai (hata deta hai)
// URL mein game ID aur review ID dono zaroori hain
const deleteReview = async (req, res) => {
  try {
    // URL se IDs nikaalte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    const { reviewId } = req.params;
    if (!reviewId) return res.status(400).json({ message: 'Review ID required hai' });

    // Game ko data se find karte hain
    const game = await Game.findOne(findAppIdQuery(appid));
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Reviews list se us review ko nikaal dete hain jo delete karna hai
    // Filter se sirf wo reviews bathe hain jo delete nahi hona
    const originalLength = game.reviews?.length || 0;
    game.reviews = game.reviews?.filter(r => r._id?.toString() !== reviewId) || [];

    // Check karte hain ki review actually delete hua ya nahi
    if (game.reviews.length === originalLength) {
      return res.status(404).json({ message: 'Review nahi mila' });
    }

    // Game ko save karte hain
    await game.save();

    // Success message bhejte hain
    res.json({ message: 'Review delete ho gaya' });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting review', error: e.message });
  }
};

// GET /api/v1/games/:appid/system-requirements
// Game ke computer specs (jaroorat) bhejta hai
// Ismein minimum aur recommended dono specs hote hain
// Example:
// {
//   "minimum": {"os": "Windows 10", "cpu": "Intel i5", "ram": "8GB"},
//   "recommended": {"os": "Windows 11", "cpu": "Intel i7", "ram": "16GB"}
// }
const getSystemRequirements = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Game ke specs ko data se dhundhte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name systemRequirements');
    
    // Agar game nahi hai
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Specs return karte hain
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      systemRequirements: game.systemRequirements || null 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching system requirements', error: e.message });
  }
};

// GET /api/v1/games/:appid/dlc
// Game ke extra content (DLC) ki list bhejta hai
// DLC matlab downloadable content - jaise extra levels, characters, outfits etc.
// Example:
// {
//   "dlcList": [
//     {"name": "Season Pass", "price": "$19.99"},
//     {"name": "Expansion Pack", "price": "$29.99"}
//   ]
// }
const getDLC = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Game ke DLC ko data se dhundhte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name dlcList');
    
    // Agar game nahi hai
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // DLC list return karte hain (kitne DLC hain aur list kya hai)
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      dlcCount: (game.dlcList || []).length,
      dlcList: game.dlcList || [] 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching DLC', error: e.message });
  }
};

// GET /api/v1/games/:appid/achievements
// Game ke achievements (badges/medals) ki list bhejta hai
// Achievements matlab jo medals milte hain game khelne par
// Jaise "10 enemies kill karo toh 'Killer' achievement milegi"
const getAchievements = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Game ke achievements ko data se dhundhte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name achievements');
    
    // Agar game nahi hai
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // URL se limit nikaalte hain (kitne achievements dikhane hain, default 50)
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 50);
    
    // Achievements ko slice karke limit tak dikhate hain
    const achievements = (game.achievements || []).slice(0, limit);
    
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      totalAchievements: (game.achievements || []).length,
      achievements 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching achievements', error: e.message });
  }
};

// GET /api/v1/games/:appid/leaderboards
// Game ke rankings (leaderboard) bhejta hai
// Leaderboard mein top players aur unke scores likhe hote hain
// Jaise "Top 100 players aur unka rank"
const getLeaderboards = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Game ke rankings ko data se dhundhte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name leaderboards');
    
    // Agar game nahi hai
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // URL se limit nikaalte hain (top kitne players dikhane hain, default 100)
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 100);
    
    // Top players ko limit tak dikhate hain
    const leaderboards = (game.leaderboards || []).slice(0, limit);
    
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      leaderboardCount: (game.leaderboards || []).length,
      leaderboards 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching leaderboards', error: e.message });
  }
};

// GET /api/v1/games/:appid/updates
// Game ke latest updates/patches bhejta hai
// Updates matlab jo fixes aur naye features add hote hain
// Jaise "bug fix kiya ya naya level add kiya"
const getUpdates = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Game ke updates ko data se dhundhte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name updates');
    
    // Agar game nahi hai
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // URL se limit nikaalte hain (kitne latest updates dikhane hain, default 20)
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
    
    // Updates ko newest pehle karke limit tak dikhate hain
    const updates = (game.updates || [])
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
    
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      totalUpdates: (game.updates || []).length,
      updates 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching updates', error: e.message });
  }
};

// GET /api/v1/games/:appid/news
// Game ki news/announcements bhejta hai
// News matlab dev ne kya bola - jaise "naya update aa raha hai" ya "tournament ho raha hai"
// URL se limit nikaal kar sirf latest news dikha sakte ho
const getNews = async (req, res) => {
  try {
    // URL se game ID nikaal kar check karte hain
    const appid = parseAppId(req.params.appid);
    if (appid === null) return res.status(400).json({ message: 'Invalid appid' });

    // Game ki news ko data se dhundhte hain
    const game = await Game.findOne(findAppIdQuery(appid)).select('appid name news');
    
    // Agar game nahi hai
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // URL se limit nikaalte hain (kitni latest news dikhane hain, default 20)
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
    
    // News ko newest pehle karke limit tak dikhate hain
    const news = (game.news || [])
      .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
      .slice(0, limit);
    
    res.json({ 
      appid: game.appid, 
      name: game.name, 
      totalNews: (game.news || []).length,
      news 
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching news', error: e.message });
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
  getScreenshots,
  getTrailers,
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  getSystemRequirements,
  getDLC,
  getAchievements,
  getLeaderboards,
  getUpdates,
  getNews,
};
