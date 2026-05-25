const mongoose = require('mongoose');
const Game = require('./src/models/gameModel');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('connected');
    console.log('count', await Game.countDocuments());
    console.log('oneNum', await Game.findOne({ appid: 2446200 }));
    console.log('oneStr', await Game.findOne({ appid: '2446200' }));
    console.log('or', await Game.findOne({ $or: [{ appid: 2446200 }, { appid: '2446200' }] }));
    const sample = await Game.findOne().lean();
    console.log('sample', sample);
    const raw = await Game.collection.findOne({ appid: 2446200 });
    console.log('rawNum', raw);
    const rawStr = await Game.collection.findOne({ appid: '2446200' });
    console.log('rawStr', rawStr);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
})();
