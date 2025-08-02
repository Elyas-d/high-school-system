const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const db = require('../../models');
const logger = require('../utils/logger');

const router = Router();

// POST /api/parents/link - Link parent to student (Admin only)
router.post('/link', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { parentId, studentId } = req.body;
    const parent = await db.Parent.findByPk(parentId);
    const student = await db.Student.findByPk(studentId);
    if (!parent || !student) {
      return res.status(404).json({ error: 'Parent or student not found' });
    }
    // Add association in join table
    await parent.addStudent(student);
    res.json({ message: 'Parent linked to student', parentId, studentId });
  } catch (err) {
    logger.error('Error linking parent to student:', err);
    res.status(500).json({ error: 'Failed to link parent to student' });
  }
});

// GET /api/parents/:id/grades - View child grades (Admin/Parent)
router.get('/:id/grades', authenticate, authorize(['ADMIN', 'PARENT']), async (req, res) => {
  // No grade model found, so return a placeholder
  res.status(501).json({ error: 'Grades functionality not implemented. No grade model found.' });
});

// GET /api/parents/:id/attendance - View child attendance (Admin/Parent)
router.get('/:id/attendance', authenticate, authorize(['ADMIN', 'PARENT']), async (req, res) => {
  // No attendance model found, so return a placeholder
  res.status(501).json({ error: 'Attendance functionality not implemented. No attendance model found.' });
});

module.exports = router; 