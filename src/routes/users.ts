import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';
import { validateDto } from '../common/middleware/validateDto';
import { CreateUserDto } from '../modules/user/dto/CreateUserDto';
import { UserRole } from '@prisma/client';

const router = Router();
const userController = new UserController();

// Public route - no authentication required
router.get('/public', (req, res) => {
  res.json({ message: 'Public user info' });
});

// Protected routes with authentication and authorization
router.get('/', authenticate, authorize([UserRole.ADMIN]), userController.list);
router.get('/:id', authenticate, authorize([UserRole.ADMIN, UserRole.STAFF]), userController.getById);
router.post('/', authenticate, authorize([UserRole.ADMIN]), validateDto(CreateUserDto), userController.create);
router.put('/:id', authenticate, authorize([UserRole.ADMIN]), userController.update);
router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), userController.delete);

// User profile route - authenticated users can access their own profile
router.get('/me', authenticate, (req, res) => {
  res.json({ 
    message: 'User profile', 
    user: req.user 
  });
});

export default router; 