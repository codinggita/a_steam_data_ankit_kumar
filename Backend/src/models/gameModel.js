const mongoose = require('mongoose');

// Game schema define karta hai ki MongoDB mein Game collection ka data kaisa dikhna chahiye.
// Ye ek blueprint hai jisse har game document validate hota hai.
const gameSchema = new mongoose.Schema({
  appid: { type: String, required: true, unique: true }, // Steam app id, har game ke liye unique
  name: { type: String, required: true }, // game ka naam
  short_description: String, // chhota description
  description: String, // full description
  release_date: String, // release date (jaise "Jul 5, 2024")
  developer: String, // developer ka naam (game banane wali company)
  publisher: String, // publisher ka naam (game release karne wali company)
  
  // Genres field ko hum string aur array dono handle karenge, isliye Mixed use kiya hai.
  // Database mein ye semicolon-separated string hai (jaise "Action;RPG").
  genres: mongoose.Schema.Types.Mixed, // game ke genres (category) list ya string
  
  price: { type: Number, default: 0 }, // price (sasta ya mehenga, free games ke liye 0)
  tags: [String], // game tags list (jaise "multiplayer", "survival")
  isArchived: { type: Boolean, default: false }, // game ko hide/archive karne ke liye flag
  
  // Extra fields jo raw MongoDB dataset mein hain:
  categories: String, // categories (jaise "Single-player;Steam Achievements")
  recommendations: { type: String, default: "0" }, // total likes/recommendations count (as string in DB)
  release_year: String, // release year (jaise "2024")
  
  // Naye fields jo hum API features aur custom updates ke liye use karenge:
  rating: { type: Number, default: 0 }, // game rating (0 se 100 ke beech, jaise 85)
  downloads: { type: Number, default: 0 }, // estimate download count (sorting ke liye)
  platforms: [String], // platforms list (jaise "PC", "Mac", "Linux")
  features: [String], // special features (jaise "Co-op", "Cloud Save")
  
  // Game details aur sub-resources ki lists:
  screenshots: [String], // game ke photos/screenshots ke image URLs
  trailers: [String], // game के trailers/gameplay videos ke video URLs
  
  // Reviews array jo reviews store karega (userId, rating 1-5, comment text)
  reviews: [
    {
      userId: { type: String, required: true }, // review likhne wale user ki ID
      rating: { type: Number, required: true }, // review rating (1 se 5 stars)
      reviewText: { type: String, required: true }, // review comment text
      createdAt: { type: Date, default: Date.now }, // kis date ko review likha gaya
      updatedAt: { type: Date, default: Date.now } // kis date ko edit kiya gaya
    }
  ],
  
  systemRequirements: mongoose.Schema.Types.Mixed, // computer requirements (minimum aur recommended specs)
  dlcList: [mongoose.Schema.Types.Mixed], // downloadable extra content list (DLCs)
  achievements: [mongoose.Schema.Types.Mixed], // achievements list (medals/badges)
  leaderboards: [mongoose.Schema.Types.Mixed], // leaderboard rankings (scores of top players)
  updates: [mongoose.Schema.Types.Mixed], // game updates/patches list
  news: [mongoose.Schema.Types.Mixed], // latest game related news/announcements list
  
  history: [
    {
      // history array mein database changes ka log store hota hai
      updatedAt: { type: Date, default: Date.now },
      changes: mongoose.Schema.Types.Mixed,
    },
  ],
}, { timestamps: true, collection: 'Games' }); // timestamps: createdAt aur updatedAt automatic add hota hai

// Game model export.
// Model name = 'Games', collection name explicitly = 'Games'.
// Isse Mongoose default lowercase/pluralise behaviour skip ho jata hai.
module.exports = mongoose.model('Games', gameSchema, 'Games');
