const jwt = require('jsonwebtoken');

/**
 * Token Blacklist Service
 * Manages blacklisted JWT tokens to prevent their reuse after logout
 */
class TokenBlacklistService {
  constructor() {
    // In-memory blacklist (for development/small scale)
    // In production, use Redis or database
    this.blacklistedTokens = new Set();
    
    // Clean up expired tokens every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredTokens();
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Add token to blacklist
   * @param {string} token - JWT token to blacklist
   */
  blacklistToken(token) {
    try {
      // Decode token to get expiration time (without verification since we're blacklisting it)
      const decoded = jwt.decode(token);
      
      if (decoded && decoded.exp) {
        // Store token with its expiration time
        this.blacklistedTokens.add(JSON.stringify({
          token,
          exp: decoded.exp,
          blacklistedAt: Math.floor(Date.now() / 1000)
        }));
        
        console.log(`Token blacklisted: ${token.substring(0, 20)}...`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error blacklisting token:', error);
      return false;
    }
  }

  /**
   * Check if token is blacklisted
   * @param {string} token - JWT token to check
   * @returns {boolean} - True if token is blacklisted
   */
  isTokenBlacklisted(token) {
    try {
      for (const blacklistedEntry of this.blacklistedTokens) {
        const entry = JSON.parse(blacklistedEntry);
        if (entry.token === token) {
          // Check if token is still within its expiration time
          const currentTime = Math.floor(Date.now() / 1000);
          if (currentTime < entry.exp) {
            return true; // Token is blacklisted and still valid
          } else {
            // Token has expired, remove from blacklist
            this.blacklistedTokens.delete(blacklistedEntry);
            return false;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking blacklisted token:', error);
      return false;
    }
  }

  /**
   * Clean up expired tokens from blacklist
   */
  cleanupExpiredTokens() {
    const currentTime = Math.floor(Date.now() / 1000);
    let cleanedCount = 0;

    for (const blacklistedEntry of this.blacklistedTokens) {
      try {
        const entry = JSON.parse(blacklistedEntry);
        if (currentTime >= entry.exp) {
          this.blacklistedTokens.delete(blacklistedEntry);
          cleanedCount++;
        }
      } catch (error) {
        // Remove malformed entries
        this.blacklistedTokens.delete(blacklistedEntry);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired tokens from blacklist`);
    }
  }

  /**
   * Get blacklist statistics
   * @returns {object} - Blacklist statistics
   */
  getStats() {
    return {
      totalBlacklistedTokens: this.blacklistedTokens.size,
      lastCleanup: new Date().toISOString()
    };
  }

  /**
   * Clear all blacklisted tokens (for testing/admin purposes)
   */
  clearAll() {
    const count = this.blacklistedTokens.size;
    this.blacklistedTokens.clear();
    console.log(`Cleared ${count} tokens from blacklist`);
    return count;
  }

  /**
   * Blacklist all tokens for a specific user (useful for security incidents)
   * @param {number} userId - User ID to blacklist all tokens for
   */
  blacklistAllUserTokens(userId) {
    // This would require storing user-token mappings
    // For now, we'll implement a simpler version
    console.log(`Blacklisting all tokens for user ${userId} - feature not fully implemented`);
    // TODO: Implement user-specific token tracking
  }

  /**
   * Cleanup on service shutdown
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Singleton instance
const tokenBlacklistService = new TokenBlacklistService();

// Graceful shutdown cleanup
process.on('SIGINT', () => {
  tokenBlacklistService.destroy();
});

process.on('SIGTERM', () => {
  tokenBlacklistService.destroy();
});

module.exports = tokenBlacklistService;
