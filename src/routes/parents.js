const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const parentController = require('../controllers/parentController');

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Parents
 *     description: Parent management and parent-student relationships
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
 *         studentId:
 *           type: integer
 *         subjectId:
 *           type: integer
 *         classId:
 *           type: integer
 *         gradeValue:
 *           type: number
 *           format: decimal
 *         gradeType:
 *           type: string
 *           enum: [EXAM, QUIZ, ASSIGNMENT, PROJECT, PARTICIPATION]
 *         maxPoints:
 *           type: number
 *           format: decimal
 *         description:
 *           type: string
 *         gradedAt:
 *           type: string
 *           format: date-time
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
 *         studentId:
 *           type: integer
 *         classId:
 *           type: integer
 *         subjectId:
 *           type: integer
 *         date:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [PRESENT, ABSENT, LATE, EXCUSED]
 *         notes:
 *           type: string
 *         recordedAt:
 *           type: string
 *           format: date-time
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
 *         present:
 *           type: integer
 *         absent:
 *           type: integer
 *         late:
 *           type: integer
 *         excused:
 *           type: integer
 *         attendanceRate:
 *           type: string
 */

/**
 * @swagger
 * /parents/signup:
 *   post:
 *     tags: [Parents]
 *     summary: Register a new parent and link to a student
 *     description: Creates a new user with the PARENT role, an associated parent profile, and links them to a student.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - studentId
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               phoneNumber:
 *                 type: string
 *               studentId:
 *                 type: integer
 *                 description: The ID of the student to link to this parent.
 *           example:
 *             firstName: "John"
 *             lastName: "Doe"
 *             email: "john.doe@example.com"
 *             password: "password123"
 *             phoneNumber: "123-456-7890"
 *             studentId: 1
 *     responses:
 *       201:
 *         description: Parent registered and linked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - Missing required fields.
 *       404:
 *         description: Student not found.
 *       409:
 *         description: Conflict - A user with this email already exists.
 *       500:
 *         description: Internal server error.
 */
router.post('/signup', parentController.signUp);

/**
 * @swagger
 * /parents/link:
 *   post:
 *     tags: [Parents]
 *     summary: Link parent to student
 *     description: Create a many-to-many relationship between a parent and student
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
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
 * /parents/me/children:
 *   get:
 *     tags: [Parents]
 *     summary: Get current parent's children
 *     description: Retrieve a list of children linked to the currently authenticated parent.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved children.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       User:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       403:
 *         description: Forbidden - User is not a parent.
 *       404:
 *         description: Parent profile not found for the current user.
 *       500:
 *         description: Internal server error.
 */
router.get('/me/children', authenticate, authorize(['PARENT']), parentController.getMyChildren);

/**
 * @swagger
 * /parents/{id}/grades:
 *   get:
 *     tags: [Parents]
 *     summary: View child grades
 *     description: Retrieve grades for all children of a specific parent with optional filtering
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
 *                 message:
 *                   type: string
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
 *     tags: [Parents]
 *     summary: View child attendance
 *     description: Retrieve attendance records for all children of a specific parent with statistics
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
 *                 message:
 *                   type: string
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

/**
 * @swagger
 * /parents/{id}:
 *   delete:
 *     tags: [Parents]
 *     summary: Delete a parent
 *     description: Deletes a parent and their associated user account. This action is irreversible.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the parent to delete.
 *     responses:
 *       200:
 *         description: Parent deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       403:
 *         description: Forbidden - Admin access required.
 *       404:
 *         description: Parent not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/:id', authenticate, authorize(['ADMIN']), parentController.deleteParent);

module.exports = router;