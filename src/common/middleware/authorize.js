const authorize = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          statusCode: 401,
          message: 'Authentication required',
        });
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          statusCode: 403,
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
        });
      }

      // User is authorized, proceed
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        statusCode: 500,
        message: 'Authorization failed',
      });
    }
  };
};

module.exports = authorize;