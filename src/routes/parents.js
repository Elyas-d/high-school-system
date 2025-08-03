const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const parentController = require('../controllers/parentController');

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LinkParentStudentRequest:
 *       type: object
 *       required:
 *         - parentId
 *         - studentId
 *       properties:
 *         parentId:
 *           type: integer
 *           description: ID of the parent to link
 *         studentId:
 *           type: integer
 *           description: ID of the student to link
 *     Grade:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the grade
 *         studentId:
 *           type: integer
 *           description: Student ID
 *         subjectId:
 *           type: integer
 *           description: Subject ID
 *         classId:
 *           type: integer
 *           description: Class ID
 *         gradeValue:
 *           type: number
 *           format: decimal
 *           description: Grade value (0-100)
 *         gradeType:
 *           type: string
 *           enum: [EXAM, QUIZ, ASSIGNMENT, PROJECT, PARTICIPATION]
 *           description: Type of grade
 *         maxPoints:
 *           type: number
 *           format: decimal
 *           description: Maximum points possible
 *         description:
 *           type: string
 *           description: Grade description
 *         gradedAt:
 *           type: string
 *           format: date-time
 *           description: When the grade was recorded
 *         Student:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             User:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *         Subject:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             description:
 *               type: string
 *         Class:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             schedule:
 *               type: string
 *             roomNumber:
 *               type: string
 *     Attendance:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the attendance record
 *         studentId:
 *           type: integer
 *           description: Student ID
 *         classId:
 *           type: integer
 *           description: Class ID
 *         subjectId:
 *           type: integer
 *           description: Subject ID
 *         date:
 *           type: string
 *           format: date
 *           description: Attendance date
 *         status:
 *           type: string
 *           enum: [PRESENT, ABSENT, LATE, EXCUSED]
 *           description: Attendance status
 *         notes:
 *           type: string
 *           description: Additional notes
 *         recordedAt:
 *           type: string
 *           format: date-time
 *           description: When the attendance was recorded
 *         Student:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             User:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *         Class:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             schedule:
 *               type: string
 *             roomNumber:
 *               type: string
 *             Subject:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *     AttendanceStatistics:
 *       type: object
 *       properties:
 *         totalRecords:
 *           type: integer
 *           description: Total attendance records
 *         present:
 *           type: integer
 *           description: Number of present records
 *         absent:
 *           type: integer
 *           description: Number of absent records
 *         late:
 *           type: integer
 *           description: Number of late records
 *         excused:
 *           type: integer
 *           description: Number of excused records
 *         attendanceRate:
 *           type: string
 *           description: Attendance rate percentage
 */

/**
 * @swagger
 * /parents/link:
 *   post:
 *     summary: Link parent to student
 *     description: Create a many-to-many relationship between a parent and student
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LinkParentStudentRequest'
 *           example:
 *             parentId: 1
 *             studentId: 5
 *     responses:
 *       200:
 *         description: Parent linked to student successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Parent linked to student successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     parent:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     student:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *       400:
 *         description: Bad request - Missing required fields
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Parent or student not found
 *       409:
 *         description: Conflict - Parent already linked to student
 *       500:
 *         description: Internal server error
 */
router.post('/link', authenticate, authorize(['ADMIN']), parentController.linkToStudent);

/**
 * @swagger
 * /parents/{id}/grades:
 *   get:
 *     summary: View child grades
 *     description: Retrieve grades for all children of a specific parent with optional filtering
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent ID
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *         description: Filter by specific student ID
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: integer
 *         description: Filter by subject ID
 *       - in: query
 *         name: gradeType
 *         schema:
 *           type: string
 *           enum: [EXAM, QUIZ, ASSIGNMENT, PROJECT, PARTICIPATION]
 *         description: Filter by grade type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter grades from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter grades until this date
 *     responses:
 *       200:
 *         description: Child grades retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Child grades retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Grade'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Access denied or insufficient permissions
 *       404:
 *         description: Parent not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/grades', authenticate, authorize(['ADMIN', 'PARENT']), parentController.getChildGrades);

/**
 * @swagger
 * /parents/{id}/attendance:
 *   get:
 *     summary: View child attendance
 *     description: Retrieve attendance records for all children of a specific parent with statistics
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent ID
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *         description: Filter by specific student ID
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: Filter by class ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PRESENT, ABSENT, LATE, EXCUSED]
 *         description: Filter by attendance status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter attendance from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter attendance until this date
 *     responses:
 *       200:
 *         description: Child attendance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Child attendance retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     attendance:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Attendance'
 *                     statistics:
 *                       $ref: '#/components/schemas/AttendanceStatistics'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Access denied or insufficient permissions
 *       404:
 *         description: Parent not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/attendance', authenticate, authorize(['ADMIN', 'PARENT']), parentController.getChildAttendance);

module.exports = router;