import { Router } from 'express';
import pingRoutes from './pingRoutes';
import authRoutes from './authRoutes';

const router = Router();

// Mount routes
router.use('/ping', pingRoutes);
router.use('/auth', authRoutes);

export default router; 