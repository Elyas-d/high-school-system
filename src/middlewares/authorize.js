// This middleware is equivalent to the checkRole(allowedRoles) described in requirements.
// Usage: authorize(['TEACHER']) protects a route for teachers only, etc.
// Attach after authentication middleware that sets req.user.
function authorize(allowedRoles) {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !user.role) {
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized: User not authenticated',
        timestamp: new Date().toISOString(),
      });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        status: 403,
        message: `Forbidden: User role '${user.role}' is not allowed to access this resource`,
        timestamp: new Date().toISOString(),
      });
    }
    next();
  };
}

module.exports = { authorize }; 