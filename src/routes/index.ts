import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './users';
import studentRoutes from './students';
import teacherRoutes from './teachers';
import parentRoutes from './parents';
import classRoutes from './classes';
import gradeRoutes from './grades';
import subjectRoutes from './subjects';
import exampleRoutes from './example';

const router = Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/parents', parentRoutes);
router.use('/classes', classRoutes);
router.use('/grades', gradeRoutes);
router.use('/subjects', subjectRoutes);
router.use('/example', exampleRoutes);

export default router; 