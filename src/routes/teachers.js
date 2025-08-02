const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');

// Placeholder teacher controller
const teacherController = {
  list: (req, res) => res.json({ message: 'List teachers (admin only)' }),
  read: (req, res) => res.json({ message: 'Get teacher by ID', id: req.params.id }),
  create: (req, res) => res.json({ message: 'Create teacher (admin only)' }),
  update: (req, res) => res.json({ message: 'Update teacher (admin only)', id: req.params.id }),
  delete: (req, res) => res.json({ message: 'Delete teacher (admin only)', id: req.params.id }),
  assignSubjectsAndClasses: (req, res) => res.json({ message: 'Assign subjects and classes', id: req.params.id }),
  listAssignedClasses: (req, res) => res.json({ message: 'List assigned classes', id: req.params.id })
};

const router = Router();

router.get('/', authenticate, authorize(['ADMIN']), teacherController.list);
router.get('/:id', authenticate, authorize(['ADMIN', 'TEACHER']), teacherController.read);
router.post('/', authenticate, authorize(['ADMIN']), teacherController.create);
router.put('/:id', authenticate, authorize(['ADMIN']), teacherController.update);
router.delete('/:id', authenticate, authorize(['ADMIN']), teacherController.delete);
router.post('/:id/assign', authenticate, authorize(['ADMIN']), teacherController.assignSubjectsAndClasses);
router.get('/:id/classes', authenticate, authorize(['ADMIN', 'TEACHER']), teacherController.listAssignedClasses);

module.exports = router; 