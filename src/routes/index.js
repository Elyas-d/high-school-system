const { Router } = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./users');
const studentRoutes = require('./students');
const teacherRoutes = require('./teachers');
const parentRoutes = require('./parents');
const classRoutes = require('./classes');
const gradeRoutes = require('./grades');
const subjectRoutes = require('./subjects');
const tokenRoutes = require('./tokens');
const materialsRoutes = require('./materials');

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
router.use('/tokens', tokenRoutes);
router.use('/materials', materialsRoutes);

module.exports = router;