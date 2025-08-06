const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const classController = require('../controllers/classController');

const router = Router();

// GET /api/classes - List all classes (Admin/Staff)
router.get('/', authenticate, authorize(['ADMIN', 'STAFF']), classController.listAll);

// GET /api/classes/:id - Get class by ID (Admin/Staff/Teacher)
router.get('/:id', authenticate, authorize(['ADMIN', 'STAFF', 'TEACHER']), classController.read);

// POST /api/classes - Create class (Admin only)
router.post('/', authenticate, authorize(['ADMIN']), classController.create);

// PUT /api/classes/:id - Update class (Admin only)
router.put('/:id', authenticate, authorize(['ADMIN']), classController.update);

// DELETE /api/classes/:id - Delete class (Admin only)
router.delete('/:id', authenticate, authorize(['ADMIN']), classController.delete);

// POST /api/classes/:id/assign-teacher - Assign teacher to class (Admin/Teacher)
router.post('/:id/assign-teacher', authenticate, authorize(['ADMIN', 'TEACHER']), classController.assignTeacher);

// GET /api/classes/:id/schedule - Get class schedule (Admin/Staff/Teacher)
router.get('/:id/schedule', authenticate, authorize(['ADMIN', 'STAFF', 'TEACHER']), classController.getSchedule);

module.exports = router;