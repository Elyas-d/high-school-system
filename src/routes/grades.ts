import { Router } from 'express';
import { GradeController } from '../controllers/grade.controller';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';

const router = Router();
const gradeController = new GradeController();

router.post('/', authenticate, authorize(['ADMIN', 'TEACHER']), gradeController.assignGrade);
router.get('/class/:classId', authenticate, authorize(['ADMIN', 'TEACHER']), gradeController.fetchByClass);
router.get('/student/:studentId', authenticate, authorize(['ADMIN', 'TEACHER', 'PARENT']), gradeController.fetchByStudent);
router.get('/subject/:subjectId', authenticate, authorize(['ADMIN', 'TEACHER']), gradeController.fetchBySubject);
router.put('/:id', authenticate, authorize(['ADMIN', 'TEACHER']), gradeController.updateGrade);

export default router; 