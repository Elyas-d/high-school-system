import { Router } from 'express';
import { ParentController } from '../controllers/parent.controller';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';

const router = Router();
const parentController = new ParentController();

router.post('/link', authenticate, authorize(['ADMIN']), parentController.linkToStudent);
router.get('/:id/grades', authenticate, authorize(['PARENT']), parentController.viewChildGrades);
router.get('/:id/attendance', authenticate, authorize(['PARENT']), parentController.viewChildAttendance);

export default router; 