import { Router } from 'express';
import pingRoutes from './pingRoutes';
import authRoutes from './authRoutes';
import userRoutes from '../modules/user/user.routes';
import studentRoutes from '../modules/student/student.routes';
import { authorize } from '../middlewares/authorize';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

// Mount routes
router.use('/ping', pingRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/students', studentRoutes);

// Example protected admin route
router.get('/admin', authorize(['ADMIN']), (req: import('../middlewares/authorize').AuthenticatedRequest, res) => {
  res.json({
    status: 200,
    message: 'Welcome to the admin dashboard!',
    timestamp: new Date().toISOString(),
  });
});

// Example protected dashboard route
router.get('/dashboard', authenticate, (req: import('../middlewares/authenticate').AuthenticatedRequest, res) => {
  res.json({
    status: 200,
    message: 'Welcome to the dashboard!',
    timestamp: new Date().toISOString(),
  });
});

export default router; 