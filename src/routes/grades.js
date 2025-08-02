const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');

// Placeholder grade controller
const gradeController = {
  assignGrade: (req, res) => res.json({ message: 'Assign grade (admin/teacher only)' }),
  fetchByClass: (req, res) => res.json({ message: 'Fetch grades by class', classId: req.params.classId }),
  fetchByStudent: (req, res) => res.json({ message: 'Fetch grades by student', studentId: req.params.studentId }),
  fetchBySubject: (req, res) => res.json({ message: 'Fetch grades by subject', subjectId: req.params.subjectId }),
  updateGrade: (req, res) => res.json({ message: 'Update grade (admin/teacher only)', id: req.params.id })
};

const router = Router();

router.post('/', authenticate, authorize(['ADMIN', 'TEACHER']), gradeController.assignGrade);
router.get('/class/:classId', authenticate, authorize(['ADMIN', 'TEACHER']), gradeController.fetchByClass);
router.get('/student/:studentId', authenticate, authorize(['ADMIN', 'TEACHER', 'PARENT']), gradeController.fetchByStudent);
router.get('/subject/:subjectId', authenticate, authorize(['ADMIN', 'TEACHER']), gradeController.fetchBySubject);
router.put('/:id', authenticate, authorize(['ADMIN', 'TEACHER']), gradeController.updateGrade);

module.exports = router; 