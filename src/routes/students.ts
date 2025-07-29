import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { isAuthenticated } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
const studentController = new StudentController();

router.get('/', isAuthenticated, authorize(['ADMIN', 'TEACHER', 'STAFF']), studentController.listAll);
router.get('/:id', isAuthenticated, authorize(['ADMIN', 'TEACHER', 'STAFF', 'PARENT']), studentController.getById);
router.post('/', isAuthenticated, authorize(['ADMIN']), studentController.create);
router.put('/:id', isAuthenticated, authorize(['ADMIN']), studentController.update);
router.delete('/:id', isAuthenticated, authorize(['ADMIN']), studentController.delete);
router.post('/:id/assign-parent', isAuthenticated, authorize(['ADMIN']), studentController.assignParent);

export default router; 