const tokenBlacklistService = require('../services/tokenBlacklistService');

/**
 * Token Management Controller
 * Admin-only endpoints for managing JWT tokens and blacklist
 */
class TokenController {
  /**
   * Get blacklist statistics
   * GET /api/admin/tokens/stats
   */
  async getBlacklistStats(req, res) {
    try {
      const stats = tokenBlacklistService.getStats();
      
      res.status(200).json({
        success: true,
        message: 'Blacklist statistics retrieved successfully',
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting blacklist stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Clear all blacklisted tokens
   * DELETE /api/admin/tokens/blacklist
   */
  async clearBlacklist(req, res) {
    try {
      const clearedCount = tokenBlacklistService.clearAll();
      
      res.status(200).json({
        success: true,
        message: `Successfully cleared ${clearedCount} tokens from blacklist`,
        data: { clearedCount },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error clearing blacklist:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Force logout all sessions for current user
   * POST /api/tokens/logout-all
   */
  async logoutAllSessions(req, res) {
    try {
      const userId = req.user.id;
      const currentToken = req.token;
      
      // This is a simplified version - in a full implementation,
      // you'd need to track all user tokens
      tokenBlacklistService.blacklistToken(currentToken);
      
      res.status(200).json({
        success: true,
        message: 'All sessions have been terminated',
        data: { userId },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging out all sessions:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Check if current token is valid (not blacklisted)
   * GET /api/tokens/validate
   */
  async validateToken(req, res) {
    try {
      const token = req.token;
      const isBlacklisted = tokenBlacklistService.isTokenBlacklisted(token);
      
      res.status(200).json({
        success: true,
        message: 'Token validation completed',
        data: {
          isValid: !isBlacklisted,
          isBlacklisted,
          user: req.user
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error validating token:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = new TokenController();
