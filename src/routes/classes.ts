import { Router } from 'express';
import { ClassController } from '../controllers/class.controller';
import { authenticate } from '../common/middleware/authenticate';
import { authorize } from '../common/middleware/authorize';
import { UserRole } from '@prisma/client';

const router = Router();
const classController = new ClassController();

// Admin and Staff can view all classes
router.get('/', authenticate, authorize([UserRole.ADMIN, UserRole.STAFF]), classController.listAll);

// Admin, Staff, and Teachers can view specific class details
router.get('/:id', authenticate, authorize([UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER]), classController.read);

// Only Admin can create classes
router.post('/', authenticate, authorize([UserRole.ADMIN]), classController.create);

// Only Admin can update classes
router.put('/:id', authenticate, authorize([UserRole.ADMIN]), classController.update);

// Only Admin can delete classes
router.delete('/:id', authenticate, authorize([UserRole.ADMIN]), classController.delete);

// Admin and Teachers can assign teachers to classes
router.post('/:id/assign-teacher', authenticate, authorize([UserRole.ADMIN, UserRole.TEACHER]), classController.assignTeacher);

// Admin and Teachers can assign students to classes
router.post('/:id/assign-students', authenticate, authorize([UserRole.ADMIN, UserRole.TEACHER]), classController.assignStudents);

// Admin, Staff, and Teachers can view class schedules
router.get('/:id/schedule', authenticate, authorize([UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER]), classController.getSchedule);

export default router; 