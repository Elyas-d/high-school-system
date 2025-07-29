import { Router } from 'express';
import { ParentController } from '../controllers/parent.controller';
import { isAuthenticated } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';

const router = Router();
const parentController = new ParentController();

router.post('/link', isAuthenticated, authorize(['ADMIN']), parentController.linkToStudent);
router.get('/:id/grades', isAuthenticated, authorize(['ADMIN', 'PARENT']), parentController.viewChildGrades);
router.get('/:id/attendance', isAuthenticated, authorize(['ADMIN', 'PARENT']), parentController.viewChildAttendance);

export default router; 