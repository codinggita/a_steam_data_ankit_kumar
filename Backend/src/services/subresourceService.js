const Game = require('../models/gameModel');

/**
 * Generate mock screenshots for a game
 * @param {string} appid - Game App ID
 * @returns {Array<Object>} - Screenshots array
 */
const getScreenshots = (appid) => {
  return [
    { id: 1, url: `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/ss_1.jpg`, thumbnail: `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/ss_1.116x65.jpg` },
    { id: 2, url: `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/ss_2.jpg`, thumbnail: `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/ss_2.116x65.jpg` },
    { id: 3, url: `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/ss_3.jpg`, thumbnail: `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/ss_3.116x65.jpg` }
  ];
};

/**
 * Generate mock trailers/videos for a game
 * @param {string} appid - Game App ID
 * @param {string} name - Game name
 * @returns {Array<Object>} - Trailers array
 */
const getTrailers = (appid, name) => {
  return [
    {
      id: 1,
      title: `${name} Official Release Trailer`,
      thumbnail: `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`,
      video_mp4: `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/movie_max.mp4`,
      video_webm: `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/movie_max.webm`
    }
  ];
};

/**
 * Generate mock system requirements
 * @param {string} appid - Game App ID
 * @returns {Object} - System requirements
 */
const getSystemRequirements = (appid) => {
  return {
    minimum: {
      os: "Windows 10 (64-bit)",
      processor: "Intel Core i5-4460 or AMD FX-6300",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 760 or AMD Radeon R7 260x (2GB VRAM)",
      directx: "Version 11",
      storage: "30 GB available space"
    },
    recommended: {
      os: "Windows 10/11 (64-bit)",
      processor: "Intel Core i7-3770 or AMD FX-8350",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce GTX 1060 or AMD Radeon RX 480 (4GB VRAM)",
      directx: "Version 12",
      storage: "30 GB available space (SSD Recommended)"
    }
  };
};

/**
 * Generate mock DLC list
 * @param {string} appid - Game App ID
 * @param {string} name - Game name
 * @returns {Array<Object>} - DLC array
 */
const getDlcList = (appid, name) => {
  return [
    { dlc_appid: `${appid}-dlc1`, name: `${name} - Soundtrack`, price: "4.99", release_date: "Soon" },
    { dlc_appid: `${appid}-dlc2`, name: `${name} - Digital Artbook`, price: "2.99", release_date: "Soon" },
    { dlc_appid: `${appid}-dlc3`, name: `${name} - Season Pass`, price: "19.99", release_date: "Soon" }
  ];
};

/**
 * Generate mock achievements list
 * @param {string} appid - Game App ID
 * @returns {Object} - Achievements list
 */
const getAchievements = (appid) => {
  return {
    total: 5,
    highlighted: [
      { name: "First Steps", description: "Launch the game for the first time.", xp: 10, icon: "https://community.cloudflare.steamstatic.com/public/images/apps/achievements/first_steps.jpg" },
      { name: "Explorer", description: "Discover all core regions.", xp: 25, icon: "https://community.cloudflare.steamstatic.com/public/images/apps/achievements/explorer.jpg" },
      { name: "Survivor", description: "Complete a run without dying.", xp: 50, icon: "https://community.cloudflare.steamstatic.com/public/images/apps/achievements/survivor.jpg" },
      { name: "Max Level", description: "Reach the maximum player level.", xp: 75, icon: "https://community.cloudflare.steamstatic.com/public/images/apps/achievements/max_level.jpg" },
      { name: "Completionist", description: "Unlock all other achievements.", xp: 100, icon: "https://community.cloudflare.steamstatic.com/public/images/apps/achievements/perfectionist.jpg" }
    ]
  };
};

/**
 * Generate mock leaderboards
 * @param {string} appid - Game App ID
 * @returns {Array<Object>} - Leaderboard rankings
 */
const getLeaderboards = (appid) => {
  return [
    { rank: 1, username: "Speedrunner99", score: 95420, time_seconds: 412 },
    { rank: 2, username: "Achiever_Max", score: 92100, time_seconds: 450 },
    { rank: 3, username: "SteamPowerUser", score: 89700, time_seconds: 489 },
    { rank: 4, username: "GamerProX", score: 85300, time_seconds: 520 },
    { rank: 5, username: "AnkitKumar", score: 81200, time_seconds: 560 }
  ];
};

/**
 * Generate mock game updates/changelogs
 * @param {string} appid - Game App ID
 * @returns {Array<Object>} - Game updates list
 */
const getUpdates = (appid) => {
  return [
    { version: "1.2.0", title: "Performance Patch & Bugfixes", date: "June 10, 2026", details: "Optimized memory allocation, resolved crashes during asset loading, and updated graphics support." },
    { version: "1.1.0", title: "Content Expansion Update", date: "May 25, 2026", details: "Added new game modes, unlocked additional cosmetic items, and balanced weapon values." },
    { version: "1.0.0", title: "Official Launch Release", date: "May 13, 2026", details: "Initial release of the complete game client." }
  ];
};

/**
 * Generate mock game news
 * @param {string} appid - Game App ID
 * @param {string} name - Game name
 * @returns {Array<Object>} - News articles list
 */
const getNewsList = (appid, name) => {
  return [
    { id: 1, title: `${name} Wins Weekly Indie Showcase Spotlight!`, author: "Steam News Network", date: "June 12, 2026", summary: "The developer's latest release catches critical acclaim for its refined mechanics and soundtrack." },
    { id: 2, title: `Upcoming Expansion Roadmap Announced for ${name}`, author: "Developer Blogs", date: "June 05, 2026", summary: "A look ahead at planned seasons, updates, and upcoming DLC releases for the rest of the year." }
  ];
};

/**
 * Fetch related game recommendations based on shared genres (Real database query)
 * @param {string} appid - Game App ID
 * @returns {Promise<Array<Object>>} - Related games list
 */
const getRelatedGames = async (appid) => {
  const game = await Game.findOne({ appid, isDeleted: { $ne: true } });
  if (!game) return null;

  if (!game.genres) return [];

  const genresList = game.genres.split(';');
  
  // Find up to 5 games sharing at least one genre
  const query = {
    appid: { $ne: appid },
    isDeleted: { $ne: true },
    $or: genresList.map(genre => ({
      genres: { $regex: new RegExp(`(^|;)${genre}($|;)`, 'i') }
    }))
  };

  return await Game.find(query).limit(5).select('appid name genres price recommendations developer publisher').lean();
};

module.exports = {
  getScreenshots,
  getTrailers,
  getSystemRequirements,
  getDlcList,
  getAchievements,
  getLeaderboards,
  getUpdates,
  getNewsList,
  getRelatedGames
};
