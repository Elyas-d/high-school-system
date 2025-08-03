const jwt = require('jsonwebtoken');
const tokenBlacklistService = require('../services/tokenBlacklistService');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized: Missing or malformed Authorization header',
      timestamp: new Date().toISOString(),
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Check if token is blacklisted
  if (tokenBlacklistService.isTokenBlacklisted(token)) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized: Token has been revoked',
      timestamp: new Date().toISOString(),
    });
  }
  
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    return res.status(500).json({
      status: 500,
      message: 'Server error: JWT secret not configured',
      timestamp: new Date().toISOString(),
    });
  }
  
  try {
    const payload = jwt.verify(token, secret);
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'id' in payload &&
      'role' in payload
    ) {
      req.user = payload;
      req.token = token; // Store token for potential blacklisting
      next();
    } else {
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized: Invalid token payload',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized: Invalid or expired token',
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = { authenticate };