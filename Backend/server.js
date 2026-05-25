const app = require('./src/app');
const connectDB = require('./src/config/db');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB se connect karte hain. Iske bina data save/read nahi ho sakta.
connectDB();

const PORT = process.env.PORT || 5000;

// Server ko start karte hain.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
