/**
 * Middleware to check if the current month is August.
 * August is month 7 (0-indexed).
 */
module.exports = (req, res, next) => {
  const currentMonth = new Date().getMonth();
  
  // In a real application, you might want to make this configurable
  // or disable it in non-production environments.
  if (process.env.NODE_ENV === 'production' && currentMonth !== 7) {
    return res.status(403).json({ 
      error: 'This action is only available during the enrollment period (August).' 
    });
  }

  next();
};
