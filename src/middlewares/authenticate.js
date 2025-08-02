const jwt = require('jsonwebtoken');

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