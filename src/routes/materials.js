const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');

// Placeholder controller
const materialsController = {
  create: (req, res) => res.json({ message: 'Material created (teacher only)' }),
  list: (req, res) => res.json({ message: 'List of materials (teacher/student)' }),
  view: (req, res) => res.json({ message: 'View material (teacher/student)' }),
  update: (req, res) => res.json({ message: 'Material updated (teacher only)' }),
  delete: (req, res) => res.json({ message: 'Material deleted (teacher only)' }),
};

const router = Router();

// Teachers can create materials
router.post('/', authenticate, authorize(['TEACHER']), materialsController.create);
// Teachers and students can list materials
router.get('/', authenticate, authorize(['TEACHER', 'STUDENT']), materialsController.list);
// Teachers and students can view a material
router.get('/:id', authenticate, authorize(['TEACHER', 'STUDENT']), materialsController.view);
// Teachers can update materials
router.put('/:id', authenticate, authorize(['TEACHER']), materialsController.update);
// Teachers can delete materials
router.delete('/:id', authenticate, authorize(['TEACHER']), materialsController.delete);

module.exports = router; 