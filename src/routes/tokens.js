const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const tokenController = require('../controllers/tokenController');

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TokenStats:
 *       type: object
 *       properties:
 *         totalBlacklistedTokens:
 *           type: integer
 *           description: Total number of blacklisted tokens
 *         lastCleanup:
 *           type: string
 *           format: date-time
 *           description: Last cleanup timestamp
 *     TokenValidation:
 *       type: object
 *       properties:
 *         isValid:
 *           type: boolean
 *           description: Whether the token is valid
 *         isBlacklisted:
 *           type: boolean
 *           description: Whether the token is blacklisted
 *         user:
 *           type: object
 *           description: User information from token
 */

/**
 * @swagger
 * /tokens/validate:
 *   get:
 *     summary: Validate current token
 *     description: Check if the current JWT token is valid and not blacklisted
 *     tags: [Token Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token validation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token validation completed
 *                 data:
 *                   $ref: '#/components/schemas/TokenValidation'
 *       401:
 *         description: Unauthorized - Invalid or blacklisted token
 *       500:
 *         description: Internal server error
 */
router.get('/validate', authenticate, tokenController.validateToken);

/**
 * @swagger
 * /tokens/logout-all:
 *   post:
 *     summary: Logout all sessions
 *     description: Terminate all active sessions for the current user
 *     tags: [Token Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All sessions terminated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: All sessions have been terminated
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/logout-all', authenticate, tokenController.logoutAllSessions);

/**
 * @swagger
 * /admin/tokens/stats:
 *   get:
 *     summary: Get blacklist statistics
 *     description: Retrieve statistics about the token blacklist (Admin only)
 *     tags: [Admin - Token Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blacklist statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Blacklist statistics retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/TokenStats'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/admin/stats', authenticate, authorize(['ADMIN']), tokenController.getBlacklistStats);

/**
 * @swagger
 * /admin/tokens/blacklist:
 *   delete:
 *     summary: Clear token blacklist
 *     description: Remove all tokens from the blacklist (Admin only)
 *     tags: [Admin - Token Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blacklist cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Successfully cleared 5 tokens from blacklist
 *                 data:
 *                   type: object
 *                   properties:
 *                     clearedCount:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.delete('/admin/blacklist', authenticate, authorize(['ADMIN']), tokenController.clearBlacklist);

module.exports = router;
