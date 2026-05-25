const express = require('express');
const router = express.Router();
const controller = require('../controllers/gameController');

// ==================== GAME KE BASIC ROUTES ====================
// Ye routes game info ka CRUD (Create, Read, Update, Delete) karte hain
// Matlab naya game add karo, game dekho, change karo, delete karo

// GET /api/v1/games
// Sare games ko list karta hai with pagination and search
// Example: /api/v1/games?page=1&limit=20&search=Call
router.get('/', controller.getGames);

// GET /api/v1/games/exists/:appid
// Sirf check karta hai ki game exist hai ya nahi - haan ya nahi?
router.get('/exists/:appid', controller.checkGameExists);

// GET /api/v1/games/:appid/summary
// Game ka short info dikhata hai (pura nahi, sirf zaroori cheezein)
// Jaise: name, developer, price, release date
router.get('/:appid/summary', controller.getGameSummary);

// GET /api/v1/games/:appid/history
// Game mein jo changes hue ho gaye unka record dikhata hai
// Jaise "iska price change hua", "developer change hua"
router.get('/:appid/history', controller.getGameHistory);

// GET /api/v1/games/:appid/related
// Isi tarah wale (same genre) aur games suggest karta hai
// Jaise agar Elden Ring pasand hai to Dark Souls suggest karega
router.get('/:appid/related', controller.getRelatedGames);

// GET /api/v1/games/:appid
// Specific game ki puri details dikhata hai - sabkuch
// Ye sabse important route hai
router.get('/:appid', controller.getGameByAppId);

// POST /api/v1/games
// Database mein naya game add karta hai
// Request body mein appid, name aur dusri info deni padti hai
router.post('/', controller.createGame);

// PUT /api/v1/games/:appid
// Poore game record ko completely change karta hai
// Sab fields naye data se update ho jaate hain
router.put('/:appid', controller.replaceGame);

// PATCH /api/v1/games/:appid/archive
// Game ko "hide" kar deta hai (delete nahi karta, sirf visible nahi hota)
// Delete karne se pehle backup ke tarah kaam karta hai
router.patch('/:appid/archive', controller.archiveGame);

// PATCH /api/v1/games/:appid/restore
// Archived game ko wapas show karta hai
router.patch('/:appid/restore', controller.restoreGame);

// PATCH /api/v1/games/:appid
// Game ke sirf jo parts change karne hain wo change karta hai
// Baki parts jaisa hai waisa hi rahte hain
router.patch('/:appid', controller.updateGame);

// DELETE /api/v1/games/:appid
// Game ko pura delete kar deta hai - CAREFUL ye permanent hai!
router.delete('/:appid', controller.deleteGame);







// ==================== GAME INFORMATION ROUTES ====================
// Screenshots, videos, reviews, achievements, updates, news sab yahan

// GET /api/v1/games/:appid/screenshots
// Game ke images (screenshots) dikhata hai
// Gallery banane ke liye in URLs use kar sakte ho
router.get('/:appid/screenshots', controller.getScreenshots);

// GET /api/v1/games/:appid/trailers
// Game ke videos/trailers dikhata hai
// YouTube video link ya direct video player mein show kar sakte ho
router.get('/:appid/trailers', controller.getTrailers);

// ==================== REVIEW ROUTES ====================
// User reviews - log game ke baare mein kya sochte hain

// GET /api/v1/games/:appid/reviews
// Sare user reviews dekho
// Example: /api/v1/games/123/reviews?limit=10 (sirf 10 dikhega)
router.get('/:appid/reviews', controller.getReviews);

// POST /api/v1/games/:appid/reviews
// Naya review likho (apna feedback dedo)
// Body: { userId, rating (1-5), reviewText }
router.post('/:appid/reviews', controller.addReview);

// PATCH /api/v1/games/:appid/reviews/:reviewId
// Purana review edit karo
// Rating badlo ya text likho naya
router.patch('/:appid/reviews/:reviewId', controller.updateReview);

// DELETE /api/v1/games/:appid/reviews/:reviewId
// Apna review delete karo
router.delete('/:appid/reviews/:reviewId', controller.deleteReview);

// ==================== GAME KI TECHNICAL CHEEZEIN ====================
// System requirements aur DLC

// GET /api/v1/games/:appid/system-requirements
// Game ko chalane ke liye computer ki kya zaroorat hai
// Minimum aur recommended dono specs milte hain
// PC users apne computer se match kar sakte hain
router.get('/:appid/system-requirements', controller.getSystemRequirements);

// GET /api/v1/games/:appid/dlc
// Game ke extra content (DLC) - jaise naye characters, levels, outfits
// Inhe separately buy kar sakte ho
router.get('/:appid/dlc', controller.getDLC);

// ==================== PLAYER FEATURES ====================
// Achievements (medals), Leaderboards (rankings), Updates (fixes)

// GET /api/v1/games/:appid/achievements
// Game ke achievements (medals/badges) dekho
// Jaise "100 enemies kill karo toh 'Killer' medal milega"
router.get('/:appid/achievements', controller.getAchievements);

// GET /api/v1/games/:appid/leaderboards
// Top players aur unke scores dekho
// Apni ranking dekh sakte ho
// Example: /api/v1/games/123/leaderboards?limit=50 (top 50 dikhega)
router.get('/:appid/leaderboards', controller.getLeaderboards);

// ==================== GAME KI KHABAR ====================
// Updates aur news

// GET /api/v1/games/:appid/updates
// Naye patches aur fixes dekho
// Jaise "bug fix kiya" ya "naya feature add kiya"
// Example: /api/v1/games/123/updates?limit=5 (last 5 updates)
router.get('/:appid/updates', controller.getUpdates);

// GET /api/v1/games/:appid/news
// Game ke baare mein latest khabar/announcements dekho
// Developer ne kya bola - naya tournament, event, announcement etc.
// Example: /api/v1/games/123/news?limit=10 (latest 10 news)
router.get('/:appid/news', controller.getNews);

module.exports = router;
