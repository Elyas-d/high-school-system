import { Router } from 'express';
import pingRoutes from './pingRoutes';
import authRoutes from './authRoutes';
import userRoutes from '../modules/user/user.routes';
import studentRoutes from '../modules/student/student.routes';

const router = Router();

// Mount routes
router.use('/ping', pingRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/students', studentRoutes);

export default router; 