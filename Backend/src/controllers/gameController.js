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

// enrichGameData: Game document ko check karke rating, downloads, platforms aur extra details 
// dynamically add karta hai agar database mein ye information missing hai (pre-loaded games ke liye).
const enrichGameData = (game) => {
  if (!game) return game;
  
  // Game document ko raw JavaScript object mein badalte hain taki changes modify kar sakein.
  const gameObj = game.toObject ? game.toObject() : game;
  
  const appidNum = parseInt(gameObj.appid, 10) || 0;
  const recommendationsNum = parseInt(gameObj.recommendations, 10) || 0;
  
  // 1. Rating fallback: recommendations ke hisaab se realistic rating (65-98) generate karte hain.
  if (!gameObj.rating) {
    if (recommendationsNum > 0) {
      gameObj.rating = Math.min(98, Math.max(65, 75 + (recommendationsNum % 24)));
    } else {
      gameObj.rating = 60 + (appidNum % 30);
    }
  }
  
  // 2. Downloads fallback: recommendations aur appid se realistic download number calculate karte hain.
  if (!gameObj.downloads) {
    gameObj.downloads = (recommendationsNum * 12) + (appidNum % 500) + 50;
  }
  
  // 3. Platforms fallback: categories text parse karte hain ya default value PC, Mac, Linux set karte hain.
  if (!gameObj.platforms || !gameObj.platforms.length) {
    const categoriesStr = String(gameObj.categories || '').toLowerCase();
    const platforms = ['windows']; // Har Steam game Windows support karta hai
    if (categoriesStr.includes('mac') || categoriesStr.includes('apple') || (appidNum % 4 === 0)) {
      platforms.push('mac');
    }
    if (categoriesStr.includes('linux') || categoriesStr.includes('steam deck') || (appidNum % 5 === 0)) {
      platforms.push('linux');
    }
    gameObj.platforms = platforms;
  }
  
  // 4. Features fallback: categories ko semicolon se split karke list banate hain.
  if (!gameObj.features || !gameObj.features.length) {
    if (gameObj.categories) {
      gameObj.features = gameObj.categories.split(';').map(f => f.trim()).filter(Boolean);
    } else {
      gameObj.features = ['Single-player'];
    }
  }
  
  // 5. Tags fallback: genres aur categories ko tags array mein merge karte hain.
  if (!gameObj.tags || !gameObj.tags.length) {
    const tagsSet = new Set();
    if (gameObj.genres) {
      const genreStr = typeof gameObj.genres === 'string' ? gameObj.genres : String(gameObj.genres);
      genreStr.split(';').forEach(g => tagsSet.add(g.trim()));
    }
    if (gameObj.features) {
      gameObj.features.forEach(f => tagsSet.add(f));
    }
    gameObj.tags = Array.from(tagsSet);
  }
  
  // 6. Screenshots fallback: mock screenshots links generate karte hain.
  if (!gameObj.screenshots || !gameObj.screenshots.length) {
    gameObj.screenshots = [
      `https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop`,
      `https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop`
    ];
  }
  
  // 7. Trailers fallback: mock trailers video links.
  if (!gameObj.trailers || !gameObj.trailers.length) {
    gameObj.trailers = [
      `https://www.w3schools.com/html/mov_bbb.mp4`
    ];
  }
  
  // 8. Reviews fallback: reviews blank hone par default user reviews add karte hain.
  if (!gameObj.reviews || !gameObj.reviews.length) {
    gameObj.reviews = [
      {
        _id: `rev-${appidNum}-1`,
        userId: 'gamer_alok',
        rating: 5,
        reviewText: `Bilkul gazab game hai! Iska gameplay aur graphics solid hain. Highly recommended!`,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        _id: `rev-${appidNum}-2`,
        userId: 'pro_steamer',
        rating: 4,
        reviewText: `Acha game hai, story line badhiya hai. Lekin minor bugs hain jo patches se fix ho sakte hain.`,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    ];
  }
  
  // 9. System Requirements fallback: basic PC configurations specifications.
  if (!gameObj.systemRequirements) {
    gameObj.systemRequirements = {
      minimum: {
        os: 'Windows 10 64-bit',
        processor: 'Intel Core i5-4460 / AMD FX-6300',
        memory: '8 GB RAM',
        graphics: 'NVIDIA GeForce GTX 760 / AMD Radeon R7 260x with 2GB VRAM',
        storage: '25 GB available space'
      },
      recommended: {
        os: 'Windows 11 64-bit',
        processor: 'Intel Core i7-3770 / AMD FX-9590',
        memory: '16 GB RAM',
        graphics: 'NVIDIA GeForce GTX 1060 with 6GB VRAM / AMD Radeon RX 480 with 8GB VRAM',
        storage: '25 GB available space (SSD recommended)'
      }
    };
  }
  
  // 10. DLC list fallback.
  if (!gameObj.dlcList || !gameObj.dlcList.length) {
    gameObj.dlcList = [
      { name: `${gameObj.name} - Sound Track Bundle`, price: 2.99, appid: `${appidNum + 1}` },
      { name: `${gameObj.name} - Elite Skins Pack`, price: 4.99, appid: `${appidNum + 2}` }
    ];
  }
  
  // 11. Achievements fallback.
  if (!gameObj.achievements || !gameObj.achievements.length) {
    gameObj.achievements = [
      { name: 'First Blood', description: 'Kill your first enemy in the game', unlocked: true },
      { name: 'Survivor', description: 'Survive for 1 hour without dying', unlocked: false },
      { name: 'Completionist', description: 'Unlock 100% of all achievements', unlocked: false }
    ];
  }
  
  // 12. Leaderboards fallback.
  if (!gameObj.leaderboards || !gameObj.leaderboards.length) {
    gameObj.leaderboards = [
      { rank: 1, username: 'GamerGod_99', score: 99990 },
      { rank: 2, username: 'ShadowBlade', score: 87450 },
      { rank: 3, username: 'NinjaSteam', score: 75000 }
    ];
  }
  
  // 13. Updates fallback.
  if (!gameObj.updates || !gameObj.updates.length) {
    gameObj.updates = [
      { version: 'v1.0.2', title: 'Stability Patch', description: 'Fixed crash issues on startup and optimized memory usage.', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { version: 'v1.0.1', title: 'Launch Hotfix', description: 'Resolved audio delay issue and fixed spelling mistakes.', date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) }
    ];
  }
  
  // 14. News fallback.
  if (!gameObj.news || !gameObj.news.length) {
    gameObj.news = [
      { title: `${gameObj.name} Is Now Live!`, description: 'We are thrilled to launch the game worldwide. Thank you for your support!', publishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { title: 'Upcoming Summer DLC Announcement', description: 'Stay tuned for a brand new map and outfits coming this July!', publishedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
    ];
  }
  
  return gameObj;
};

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
    
    // Game details ko fallback parameters (rating, downloads, etc.) se enrich karte hain.
    const enrichedGame = enrichGameData(game);
    res.json(enrichedGame);
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


// ==================== GAMES KO FILTER KARNE KE METHODS ====================
// Iske andar sab wo methods hain jo different filters se games dhundhe hain
// Har method ek specific filter use karta hai

// GET /api/v1/games/genre/:genre
// Genre (jaise Action, RPG, Strategy) ke hisaab se games return karta hai
// Kaise kaam karta hai: Genre ke naam se database mein match karte hain (case-insensitive)
const getGamesByGenre = async (req, res) => {
  try {
    // URL se genre nikaalte hain aur space hatate hain
    // Example: "action" ya "Sci-Fi" dono ko handle karte hain
    const genre = String(req.params.genre || '').trim();
    if (!genre) {
      return res.status(400).json({ message: 'Genre required hai' });
    }

    // Database mein wo games dhundhe hain jiska genres array mein ye genre ho
    // Regex use karte hain taki "Action" aur "action" dono match ho (case-insensitive)
    const games = await Game.find({ 
      genres: { $regex: genre, $options: 'i' } 
    }).limit(100); // Max 100 games return karte hain

    res.json({
      filter: 'genre',
      value: genre,
      count: games.length,
      games
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by genre', error: e.message });
  }
};

// GET /api/v1/games/developer/:developer
// Developer (jo game banata hai) ke hisaab se games return karta hai
// Example: Rockstar Games, FromSoftware, Valve
const getGamesByDeveloper = async (req, res) => {
  try {
    // URL se developer ka naam nikaalte hain
    const developer = String(req.params.developer || '').trim();
    if (!developer) {
      return res.status(400).json({ message: 'Developer name required hai' });
    }

    // Database mein wo games dhundhe hain jiska developer match ho
    // Case-insensitive match use karte hain
    const games = await Game.find({ 
      developer: { $regex: developer, $options: 'i' } 
    }).limit(100);

    res.json({
      filter: 'developer',
      value: developer,
      count: games.length,
      games
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by developer', error: e.message });
  }
};

// GET /api/v1/games/publisher/:publisher
// Publisher (jo game release karta hai) ke hisaab se games return karta hai
// Example: Sony, Microsoft, EA, Ubisoft
const getGamesByPublisher = async (req, res) => {
  try {
    // URL se publisher ka naam nikaalte hain
    const publisher = String(req.params.publisher || '').trim();
    if (!publisher) {
      return res.status(400).json({ message: 'Publisher name required hai' });
    }

    // Database mein wo games dhundhe hain jiska publisher match ho
    // Case-insensitive match
    const games = await Game.find({ 
      publisher: { $regex: publisher, $options: 'i' } 
    }).limit(100);

    res.json({
      filter: 'publisher',
      value: publisher,
      count: games.length,
      games
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by publisher', error: e.message });
  }
};

// GET /api/v1/games/platform/:platform
// Platform (PC, PlayStation, Xbox, Nintendo) ke hisaab se games return karta hai
// Ye bataata hai ke game kaun kaun se systems par available hai
const getGamesByPlatform = async (req, res) => {
  try {
    // URL se platform nikaalte hain
    // Example: "pc", "playstation", "xbox", "nintendo"
    const platform = String(req.params.platform || '').trim();
    if (!platform) {
      return res.status(400).json({ message: 'Platform required hai' });
    }

    // Database mein wo games dhundhe hain jiska platforms array mein ye platform ho
    // Game multiple platforms par available ho sakta hai (jaise PC aur PS5 dono)
    const games = await Game.find({ 
      platforms: { $regex: platform, $options: 'i' } 
    }).limit(100);

    res.json({
      filter: 'platform',
      value: platform,
      count: games.length,
      games
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by platform', error: e.message });
  }
};

// GET /api/v1/games/tag/:tag
// Tag (small labels) ke hisaab se games return karta hai
// Tag matlab chhota label - jaise "multiplayer", "survival", "indie", "pixel-art"
const getGamesByTag = async (req, res) => {
  try {
    // URL se tag nikaalte hain
    const tag = String(req.params.tag || '').trim();
    if (!tag) {
      return res.status(400).json({ message: 'Tag required hai' });
    }

    // Database mein wo games dhundhe hain jiska tags array mein ye tag ho
    // Har game ke multiple tags ho sakte hain
    const games = await Game.find({ 
      tags: { $regex: tag, $options: 'i' } 
    }).limit(100);

    res.json({
      filter: 'tag',
      value: tag,
      count: games.length,
      games
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by tag', error: e.message });
  }
};

// GET /api/v1/games/release-year/:year
// Release year (kitne saal pehle game release hua) ke hisaab se games return karta hai
// Example: /api/v1/games/release-year/2023 → 2023 mein aye games
const getGamesByReleaseYear = async (req, res) => {
  try {
    // URL se year nikaalte hain aur check karte hain ke valid year hai ya nahi
    const year = parseInt(req.params.year, 10);
    if (isNaN(year) || year < 1900 || year > 2100) {
      return res.status(400).json({ message: 'Valid year required hai (1900-2100)' });
    }

    // Year se date ranges nikaalte hain
    // January 1 se December 31 tak ke liye
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // Database mein wo games dhundhe hain jo iss year mein release hue
    const games = await Game.find({ 
      releaseDate: { 
        $gte: startDate, 
        $lte: endDate 
      } 
    }).limit(100);

    res.json({
      filter: 'release-year',
      value: year,
      count: games.length,
      games
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by release year', error: e.message });
  }
};

// GET /api/v1/games/rating/:rating
// Rating (game ki quality score) ke hisaab se games return karta hai
// Rating typically 0-100 ya 0-10 scale par hota hai
// Example: /api/v1/games/rating/80 → 80 se upar rating wale games
const getGamesByRating = async (req, res) => {
  try {
    // URL se rating minimum value nikaalte hain
    const minRating = parseFloat(req.params.rating);
    if (isNaN(minRating) || minRating < 0 || minRating > 100) {
      return res.status(400).json({ message: 'Valid rating required hai (0-100)' });
    }

    // Database mein wo games dhundhe hain jinka rating >= minRating ho
    // Matlab jo rating se zyada badhiya hain
    const games = await Game.find({ 
      rating: { $gte: minRating } 
    }).sort({ rating: -1 }).limit(100); // Highest rating pehle

    res.json({
      filter: 'rating',
      value: minRating,
      count: games.length,
      games
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by rating', error: e.message });
  }
};

// GET /api/v1/games/price/:price
// Price range ke hisaab se games return karta hai
// Price format: "min-max" (jaise "0-500" ya "500-1000")
// Ya "1000-above" for games above 1000
const getGamesByPrice = async (req, res) => {
  try {
    // URL se price range nikaalte hain
    const priceRange = String(req.params.price || '').trim();
    
    // Price range ko parse karte hain
    let minPrice = 0, maxPrice = 999999;

    if (priceRange === 'free') {
      // Free games
      minPrice = 0;
      maxPrice = 0;
    } else if (priceRange.includes('-above')) {
      // "1000-above" format
      minPrice = parseInt(priceRange.split('-')[0], 10);
      maxPrice = 999999;
    } else if (priceRange.includes('-')) {
      // "100-500" format
      const parts = priceRange.split('-');
      minPrice = parseInt(parts[0], 10);
      maxPrice = parseInt(parts[1], 10);
    } else {
      return res.status(400).json({ 
        message: 'Price format invalid. Use: "0-500" ya "500-above" ya "free"' 
      });
    }

    // Validation check karte hain
    if (isNaN(minPrice) || isNaN(maxPrice)) {
      return res.status(400).json({ message: 'Invalid price range' });
    }

    // Database mein wo games dhundhe hain jo price range mein ho
    const games = await Game.find({ 
      price: { $gte: minPrice, $lte: maxPrice } 
    }).sort({ price: 1 }).limit(100); // Sasta pehle

    res.json({
      filter: 'price',
      value: priceRange,
      priceRange: { min: minPrice, max: maxPrice },
      count: games.length,
      games
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by price', error: e.message });
  }
};

// GET /api/v1/games/feature/:feature
// Game ke special features ke hisaab se games return karta hai
// Feature matlab special capability - jaise achievements, multiplayer, cloud-save
const getGamesByFeature = async (req, res) => {
  try {
    // URL se feature nikaalte hain
    // Example: "achievements", "multiplayer", "coop", "cloud-save"
    const feature = String(req.params.feature || '').trim();
    if (!feature) {
      return res.status(400).json({ message: 'Feature required hai' });
    }

    // Database mein wo games dhundhe hain jiska features array mein ye feature ho
    const games = await Game.find({ 
      features: { $regex: feature, $options: 'i' } 
    }).limit(100);

    res.json({
      filter: 'feature',
      value: feature,
      count: games.length,
      games
    });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching games by feature', error: e.message });
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
  // Filter methods
  getGamesByGenre,
  getGamesByDeveloper,
  getGamesByPublisher,
  getGamesByPlatform,
  getGamesByTag,
  getGamesByReleaseYear,
  getGamesByRating,
  getGamesByPrice,
  getGamesByFeature,
};
