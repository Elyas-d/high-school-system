const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');

// Placeholder parent controller
const parentController = {
  linkToStudent: (req, res) => res.json({ message: 'Link parent to student (admin only)' }),
  viewChildGrades: (req, res) => res.json({ message: 'View child grades', id: req.params.id }),
  viewChildAttendance: (req, res) => res.json({ message: 'View child attendance', id: req.params.id })
};

const router = Router();

router.post('/link', authenticate, authorize(['ADMIN']), parentController.linkToStudent);
router.get('/:id/grades', authenticate, authorize(['ADMIN', 'PARENT']), parentController.viewChildGrades);
router.get('/:id/attendance', authenticate, authorize(['ADMIN', 'PARENT']), parentController.viewChildAttendance);

module.exports = router; 