import { Router } from 'express';
import { TeacherController } from '../controllers/teacher.controller';
import { isAuthenticated } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
const teacherController = new TeacherController();

router.get('/', isAuthenticated, authorize(['ADMIN']), teacherController.list);
router.get('/:id', isAuthenticated, authorize(['ADMIN', 'TEACHER']), teacherController.read);
router.post('/', isAuthenticated, authorize(['ADMIN']), teacherController.create);
router.put('/:id', isAuthenticated, authorize(['ADMIN']), teacherController.update);
router.delete('/:id', isAuthenticated, authorize(['ADMIN']), teacherController.delete);
router.post('/:id/assign', isAuthenticated, authorize(['ADMIN']), teacherController.assignSubjectsAndClasses);
router.get('/:id/classes', isAuthenticated, authorize(['ADMIN', 'TEACHER']), teacherController.listAssignedClasses);

export default router; 