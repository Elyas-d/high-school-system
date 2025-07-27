import { Router } from 'express';
import passport from 'passport';
import authController from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/authMiddleware';
import { requireAuth } from '../middlewares/roleMiddleware';

const router = Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', authenticateToken, authController.getCurrentUser);

/**
 * @route   POST /auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   POST /auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', requireAuth, authController.logout);

/**
 * @route   GET /auth/google
 * @desc    Initiate Google OAuth login
 * @access  Public
 */
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

/**
 * @route   GET /auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/auth/login',
    session: false 
  }),
  authController.googleCallback
);

export default router; 