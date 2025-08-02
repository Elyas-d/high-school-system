const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');

// Placeholder student controller
const studentController = {
  listAll: (req, res) => res.json({ message: 'List all students' }),
  getById: (req, res) => res.json({ message: 'Get student by ID', id: req.params.id }),
  create: (req, res) => res.json({ message: 'Create student' }),
  update: (req, res) => res.json({ message: 'Update student', id: req.params.id }),
  delete: (req, res) => res.json({ message: 'Delete student', id: req.params.id })
};

const router = Router();

// Student routes with role-based access
router.get('/', authenticate, authorize(['ADMIN', 'TEACHER', 'STAFF']), studentController.listAll);
router.get('/:id', authenticate, authorize(['ADMIN', 'TEACHER', 'STAFF']), studentController.getById);
router.post('/', authenticate, authorize(['ADMIN']), studentController.create);
router.put('/:id', authenticate, authorize(['ADMIN', 'TEACHER']), studentController.update);
router.delete('/:id', authenticate, authorize(['ADMIN']), studentController.delete);

module.exports = router; 