import { Router } from 'express';
import { TeacherController } from '../controllers/teacher.controller';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';

const router = Router();
const teacherController = new TeacherController();

router.get('/', authenticate, authorize(['ADMIN']), teacherController.list);
router.get('/:id', authenticate, authorize(['ADMIN', 'TEACHER']), teacherController.read);
router.post('/', authenticate, authorize(['ADMIN']), teacherController.create);
router.put('/:id', authenticate, authorize(['ADMIN']), teacherController.update);
router.delete('/:id', authenticate, authorize(['ADMIN']), teacherController.delete);
router.post('/:id/assign', authenticate, authorize(['ADMIN']), teacherController.assignSubjectsAndClasses);
router.get('/:id/classes', authenticate, authorize(['ADMIN', 'TEACHER']), teacherController.listAssignedClasses);

export default router; 