const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');

// Placeholder subject controller
const subjectController = {
  listAll: (req, res) => res.json({ message: 'List all subjects' }),
  read: (req, res) => res.json({ message: 'Get subject by ID', id: req.params.id }),
  create: (req, res) => res.json({ message: 'Create subject (admin only)' }),
  update: (req, res) => res.json({ message: 'Update subject (admin only)', id: req.params.id }),
  delete: (req, res) => res.json({ message: 'Delete subject (admin only)', id: req.params.id }),
  assignToGradeLevel: (req, res) => res.json({ message: 'Assign subject to grade level', id: req.params.id })
};

const router = Router();

router.get('/', authenticate, authorize(['ADMIN', 'TEACHER', 'STAFF']), subjectController.listAll);
router.get('/:id', authenticate, authorize(['ADMIN', 'TEACHER', 'STAFF']), subjectController.read);
router.post('/', authenticate, authorize(['ADMIN']), subjectController.create);
router.put('/:id', authenticate, authorize(['ADMIN']), subjectController.update);
router.delete('/:id', authenticate, authorize(['ADMIN']), subjectController.delete);
router.post('/:id/assign-grade-level', authenticate, authorize(['ADMIN']), subjectController.assignToGradeLevel);

module.exports = router; 