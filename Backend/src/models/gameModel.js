const mongoose = require('mongoose');

// Game schema define karta hai ki MongoDB mein Game collection ka data kaisa dikhna chahiye.
// Ye ek blueprint hai jisse har game document validate hota hai.
const gameSchema = new mongoose.Schema({
  appid: { type: String, required: true, unique: true }, // Steam app id, har game ke liye unique
  name: { type: String, required: true }, // game ka naam
  short_description: String, // chhota description
  description: String, // full description
  release_date: String, // release date
  developer: String, // developer ka naam
  publisher: String, // publisher ka naam
  genres: [String], // game ke genres list
  price: { type: Number, default: 0 }, // price, default 0
  tags: [String], // extra tags
  isArchived: { type: Boolean, default: false }, // agar game archive hai toh true
  history: [
    {
      // history array mein changes store karega
      updatedAt: { type: Date, default: Date.now },
      changes: mongoose.Schema.Types.Mixed,
    },
  ],
}, { timestamps: true, collection: 'Games' }); // timestamps: createdAt aur updatedAt automatic add hota hai

// Game model export.
// Model name = 'Games', collection name explicitly = 'Games'.
// Isse Mongoose default lowercase/pluralise behaviour skip ho jata hai.
module.exports = mongoose.model('Games', gameSchema, 'Games');
