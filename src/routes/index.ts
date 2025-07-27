import { Router } from 'express';
import pingRoutes from './pingRoutes';

const router = Router();

// Mount routes
router.use('/ping', pingRoutes);

export default router; 