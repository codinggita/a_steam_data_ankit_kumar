/**
 * Logger middleware for logging request information
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  // Attach request time to response locals
  res.locals.startTime = Date.now();
  
  // Listen for the finish event to log response status
  res.on('finish', () => {
    const duration = Date.now() - res.locals.startTime;
    console.log(`[${timestamp}] Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
  });

  next();
};

module.exports = requestLogger;
