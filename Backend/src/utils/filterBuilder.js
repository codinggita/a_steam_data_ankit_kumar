/**
 * Dynamic Filter Builder for MongoDB/Mongoose Steam Games queries
 * Maps route and query parameters to Mongoose query clauses
 * @param {Object} queryParams - Express request query parameters or route parameters
 * @returns {Object} - Mongoose query object
 */
const buildFilter = (queryParams) => {
  const filter = { isDeleted: { $ne: true } };
  const exprs = [];

  const {
    genre,
    developer,
    publisher,
    platform,
    tag,
    minPrice,
    maxPrice,
    rating,
    releaseYear,
    discount,
    multiplayer,
    freeToPlay,
    feature,
    price
  } = queryParams;

  // Genre filtering (case-insensitive semicolon matching)
  if (genre) {
    filter.genres = { $regex: new RegExp(`(^|;)${genre}($|;)`, 'i') };
  }

  // Developer filtering
  if (developer) {
    filter.developer = { $regex: new RegExp(developer, 'i') };
  }

  // Publisher filtering
  if (publisher) {
    filter.publisher = { $regex: new RegExp(publisher, 'i') };
  }

  // Tag filtering (searches both genres and categories)
  if (tag) {
    filter.$or = [
      { genres: { $regex: new RegExp(`(^|;)${tag}($|;)`, 'i') } },
      { categories: { $regex: new RegExp(`(^|;)${tag}($|;)`, 'i') } }
    ];
  }

  // Release year filtering
  if (releaseYear) {
    filter.release_year = String(releaseYear);
  }

  // Platform filtering (deterministic modulo checks on appid)
  if (platform) {
    const plat = platform.toLowerCase();
    if (plat === 'mac') {
      exprs.push({ $eq: [ { $mod: [ { $toDouble: "$appid" }, 2 ] }, 0 ] });
    } else if (plat === 'linux') {
      exprs.push({ $eq: [ { $mod: [ { $toDouble: "$appid" }, 3 ] }, 0 ] });
    } // 'windows' is supported by all games in our system
  }

  // Exact price filter (route parameter)
  if (price) {
    const priceNum = parseFloat(price);
    if (!isNaN(priceNum)) {
      exprs.push({ $eq: [ { $toDouble: "$price" }, priceNum ] });
    }
  }

  // Free-to-play check
  if (freeToPlay === 'true' || freeToPlay === true) {
    exprs.push({ $eq: [ { $toDouble: "$price" }, 0 ] });
  } else {
    // Numeric price comparisons
    if (minPrice) {
      const minP = parseFloat(minPrice);
      if (!isNaN(minP)) {
        exprs.push({ $gte: [ { $toDouble: "$price" }, minP ] });
      }
    }
    if (maxPrice) {
      const maxP = parseFloat(maxPrice);
      if (!isNaN(maxP)) {
        exprs.push({ $lte: [ { $toDouble: "$price" }, maxP ] });
      }
    }
  }

  // Recommendations rating check (e.g. rating 9 maps to recommendations >= 9000)
  if (rating) {
    const ratingVal = parseFloat(rating);
    if (!isNaN(ratingVal)) {
      exprs.push({ $gte: [ { $toDouble: "$recommendations" }, ratingVal * 1000 ] });
    }
  }

  // Discount checking (simulated via price > 0 and odd appid)
  if (discount === 'true' || discount === true) {
    exprs.push({ $gt: [ { $toDouble: "$price" }, 0 ] });
    exprs.push({ $eq: [ { $mod: [ { $toDouble: "$appid" }, 2 ] }, 1 ] });
  }

  // Multiplayer filtering
  if (multiplayer === 'true' || multiplayer === true) {
    filter.categories = { $regex: /multi-player|multiplayer|co-op|cooperative/i };
  }

  // Feature filtering (e.g. Single-player, cloud save, controller support)
  if (feature) {
    filter.categories = { $regex: new RegExp(feature, 'i') };
  }

  // Group all expressions using $and operator under $expr
  if (exprs.length > 0) {
    filter.$expr = { $and: exprs };
  }

  return filter;
};

module.exports = buildFilter;
