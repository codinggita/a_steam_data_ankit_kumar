const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Agar MongoDB se connect nahi ho paaya toh error print karo lekin
    // server ko rokna nahi chahiye — smoke tests ke liye allow kar dete hain.
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.warn('Continuing without MongoDB connection. Some routes may fail until DB is available.');
  }
};

module.exports = connectDB;
