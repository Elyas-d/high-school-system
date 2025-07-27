import { Router } from 'express';
import userController from './user.controller';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { 
  requireAdmin, 
  requireAdminOrStaff,
  requireAuth 
} from '../../middlewares/roleMiddleware';

const router = Router();

/**
 * @route   GET /users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);

/**
 * @route   GET /users/stats
 * @desc    Get user statistics (Admin only)
 * @access  Private (Admin)
 */
router.get('/stats', authenticateToken, requireAdmin, userController.getUserStatistics);

/**
 * @route   GET /users/search
 * @desc    Search users
 * @access  Private (Admin/Staff)
 */
router.get('/search', authenticateToken, requireAdminOrStaff, userController.searchUsers);

/**
 * @route   GET /users/role/:role
 * @desc    Get users by role
 * @access  Private (Admin/Staff)
 */
router.get('/role/:role', authenticateToken, requireAdminOrStaff, userController.getUsersByRole);

/**
 * @route   GET /users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, userController.getCurrentUserProfile);

/**
 * @route   PUT /users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, userController.updateCurrentUserProfile);

/**
 * @route   GET /users/:id
 * @desc    Get user by ID
 * @access  Private (Admin/Staff)
 */
router.get('/:id', authenticateToken, requireAdminOrStaff, userController.getUserById);

/**
 * @route   POST /users
 * @desc    Create new user (Admin only)
 * @access  Private (Admin)
 */
router.post('/', authenticateToken, requireAdmin, userController.createUser);

/**
 * @route   PUT /users/:id
 * @desc    Update user by ID
 * @access  Private (Admin)
 */
router.put('/:id', authenticateToken, requireAdmin, userController.updateUser);

/**
 * @route   DELETE /users/:id
 * @desc    Delete user by ID (Admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

export default router; 