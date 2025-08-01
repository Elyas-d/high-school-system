import { Router } from 'express';
import { SubjectController } from '../controllers/subject.controller';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';

const router = Router();
const subjectController = new SubjectController();

router.get('/', authenticate, authorize(['ADMIN', 'TEACHER', 'STAFF']), subjectController.listAll);
router.get('/:id', authenticate, authorize(['ADMIN', 'TEACHER', 'STAFF']), subjectController.read);
router.post('/', authenticate, authorize(['ADMIN']), subjectController.create);
router.put('/:id', authenticate, authorize(['ADMIN']), subjectController.update);
router.delete('/:id', authenticate, authorize(['ADMIN']), subjectController.delete);
router.post('/:id/assign-grade-level', authenticate, authorize(['ADMIN']), subjectController.assignToGradeLevel);

export default router; 