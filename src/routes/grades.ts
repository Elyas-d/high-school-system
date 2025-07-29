import { Router } from 'express';
import { GradeController } from '../controllers/grade.controller';
import { isAuthenticated } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
const gradeController = new GradeController();

router.post('/', isAuthenticated, authorize(['ADMIN', 'TEACHER']), gradeController.assignGrade);
router.get('/class/:classId', isAuthenticated, authorize(['ADMIN', 'TEACHER']), gradeController.fetchByClass);
router.get('/student/:studentId', isAuthenticated, authorize(['ADMIN', 'TEACHER', 'PARENT']), gradeController.fetchByStudent);
router.get('/subject/:subjectId', isAuthenticated, authorize(['ADMIN', 'TEACHER']), gradeController.fetchBySubject);
router.put('/:id', isAuthenticated, authorize(['ADMIN', 'TEACHER']), gradeController.updateGrade);

export default router; 