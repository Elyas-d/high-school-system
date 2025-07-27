import { Router } from 'express';
import studentController from './student.controller';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { 
  requireAdmin, 
  requireAdminOrStaff,
  requireTeacher,
  requireStudent,
  requireAuth 
} from '../../middlewares/roleMiddleware';

const router = Router();

/**
 * @route   GET /students
 * @desc    Get all students
 * @access  Private (Admin/Staff/Teacher)
 */
router.get('/', authenticateToken, requireAdminOrStaff, studentController.getAllStudents);

/**
 * @route   GET /students/stats
 * @desc    Get student statistics
 * @access  Private (Admin/Staff)
 */
router.get('/stats', authenticateToken, requireAdminOrStaff, studentController.getStudentStatistics);

/**
 * @route   GET /students/search
 * @desc    Search students
 * @access  Private (Admin/Staff/Teacher)
 */
router.get('/search', authenticateToken, requireAdminOrStaff, studentController.searchStudents);

/**
 * @route   GET /students/grade-level/:gradeLevelId
 * @desc    Get students by grade level
 * @access  Private (Admin/Staff/Teacher)
 */
router.get('/grade-level/:gradeLevelId', authenticateToken, requireAdminOrStaff, studentController.getStudentsByGradeLevel);

/**
 * @route   GET /students/class/:classId
 * @desc    Get students by class
 * @access  Private (Admin/Staff/Teacher)
 */
router.get('/class/:classId', authenticateToken, requireAdminOrStaff, studentController.getStudentsByClass);

/**
 * @route   GET /students/profile
 * @desc    Get current student profile
 * @access  Private (Student)
 */
router.get('/profile', authenticateToken, requireStudent, studentController.getCurrentStudentProfile);

/**
 * @route   GET /students/:id
 * @desc    Get student by ID
 * @access  Private (Admin/Staff/Teacher)
 */
router.get('/:id', authenticateToken, requireAdminOrStaff, studentController.getStudentById);

/**
 * @route   POST /students
 * @desc    Create new student
 * @access  Private (Admin)
 */
router.post('/', authenticateToken, requireAdmin, studentController.createStudent);

/**
 * @route   PUT /students/:id
 * @desc    Update student by ID
 * @access  Private (Admin)
 */
router.put('/:id', authenticateToken, requireAdmin, studentController.updateStudent);

/**
 * @route   DELETE /students/:id
 * @desc    Delete student by ID
 * @access  Private (Admin)
 */
router.delete('/:id', authenticateToken, requireAdmin, studentController.deleteStudent);

export default router; 