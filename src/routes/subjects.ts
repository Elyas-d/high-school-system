import { Router } from 'express';
import { SubjectController } from '../controllers/subject.controller';
import { isAuthenticated } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
const subjectController = new SubjectController();

router.get('/', isAuthenticated, authorize(['ADMIN', 'TEACHER', 'STAFF']), subjectController.listAll);
router.get('/:id', isAuthenticated, authorize(['ADMIN', 'TEACHER', 'STAFF']), subjectController.read);
router.post('/', isAuthenticated, authorize(['ADMIN']), subjectController.create);
router.put('/:id', isAuthenticated, authorize(['ADMIN']), subjectController.update);
router.delete('/:id', isAuthenticated, authorize(['ADMIN']), subjectController.delete);
router.post('/:id/assign-grade-level', isAuthenticated, authorize(['ADMIN']), subjectController.assignToGradeLevel);

export default router; 