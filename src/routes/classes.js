const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');

// Placeholder class controller
const classController = {
  listAll: (req, res) => res.json({ message: 'List all classes' }),
  read: (req, res) => res.json({ message: 'Get class by ID', id: req.params.id }),
  create: (req, res) => res.json({ message: 'Create class (admin only)' }),
  update: (req, res) => res.json({ message: 'Update class (admin only)', id: req.params.id }),
  delete: (req, res) => res.json({ message: 'Delete class (admin only)', id: req.params.id }),
  assignTeacher: (req, res) => res.json({ message: 'Assign teacher to class', id: req.params.id }),
  assignStudents: (req, res) => res.json({ message: 'Assign students to class', id: req.params.id }),
  getSchedule: (req, res) => res.json({ message: 'Get class schedule', id: req.params.id })
};

const router = Router();

// Admin and Staff can view all classes
router.get('/', authenticate, authorize(['ADMIN', 'STAFF']), classController.listAll);

// Admin, Staff, and Teachers can view specific class details
router.get('/:id', authenticate, authorize(['ADMIN', 'STAFF', 'TEACHER']), classController.read);

// Only Admin can create classes
router.post('/', authenticate, authorize(['ADMIN']), classController.create);

// Only Admin can update classes
router.put('/:id', authenticate, authorize(['ADMIN']), classController.update);

// Only Admin can delete classes
router.delete('/:id', authenticate, authorize(['ADMIN']), classController.delete);

// Admin and Teachers can assign teachers to classes
router.post('/:id/assign-teacher', authenticate, authorize(['ADMIN', 'TEACHER']), classController.assignTeacher);

// Admin and Teachers can assign students to classes
router.post('/:id/assign-students', authenticate, authorize(['ADMIN', 'TEACHER']), classController.assignStudents);

// Admin, Staff, and Teachers can view class schedules
router.get('/:id/schedule', authenticate, authorize(['ADMIN', 'STAFF', 'TEACHER']), classController.getSchedule);

module.exports = router; 