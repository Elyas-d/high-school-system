const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const gradeController = require('../controllers/gradeController');

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateGradeRequest:
 *       type: object
 *       required:
 *         - studentId
 *         - subjectId
 *         - gradeValue
 *       properties:
 *         studentId:
 *           type: integer
 *           description: ID of the student receiving the grade
 *         subjectId:
 *           type: integer
 *           description: ID of the subject for the grade
 *         classId:
 *           type: integer
 *           description: ID of the class (optional)
 *         gradeValue:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           maximum: 100
 *           description: Grade value (0-100 or 0-maxPoints)
 *         gradeType:
 *           type: string
 *           enum: [EXAM, QUIZ, ASSIGNMENT, PROJECT, PARTICIPATION]
 *           default: ASSIGNMENT
 *           description: Type of grade
 *         maxPoints:
 *           type: number
 *           format: decimal
 *           default: 100
 *           description: Maximum points possible for this grade
 *         description:
 *           type: string
 *           description: Additional description or notes about the grade
 *     UpdateGradeRequest:
 *       type: object
 *       properties:
 *         gradeValue:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           description: Updated grade value
 *         gradeType:
 *           type: string
 *           enum: [EXAM, QUIZ, ASSIGNMENT, PROJECT, PARTICIPATION]
 *           description: Updated grade type
 *         maxPoints:
 *           type: number
 *           format: decimal
 *           description: Updated maximum points
 *         description:
 *           type: string
 *           description: Updated description or notes
 *     GradeResponse:
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
 *           description: Grade value
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
 *                 email:
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
 *     GradeStatistics:
 *       type: object
 *       properties:
 *         totalGrades:
 *           type: integer
 *           description: Total number of grades
 *         averageGrade:
 *           type: string
 *           description: Average grade value
 *         highestGrade:
 *           type: number
 *           description: Highest grade value
 *         lowestGrade:
 *           type: number
 *           description: Lowest grade value
 */

/**
 * @swagger
 * /grades:
 *   post:
 *     summary: Assign grade to student
 *     description: Create a new grade record for a student in a specific subject
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGradeRequest'
 *           example:
 *             studentId: 1
 *             subjectId: 2
 *             classId: 3
 *             gradeValue: 85.5
 *             gradeType: EXAM
 *             maxPoints: 100
 *             description: Midterm examination
 *     responses:
 *       201:
 *         description: Grade assigned successfully
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
 *                   example: Grade assigned successfully
 *                 data:
 *                   $ref: '#/components/schemas/GradeResponse'
 *       400:
 *         description: Bad request - Validation errors
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Teacher/Admin access required
 *       404:
 *         description: Student, subject, or class not found
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, authorize(['ADMIN', 'TEACHER']), gradeController.assignGrade);

/**
 * @swagger
 * /grades/class/{classId}:
 *   get:
 *     summary: Fetch grades by class
 *     description: Retrieve all grades for students in a specific class with optional filtering
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Class ID
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
 *         description: Grades retrieved successfully
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
 *                   example: Grades retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GradeResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Teacher/Admin access required
 *       404:
 *         description: Class not found
 *       500:
 *         description: Internal server error
 */
router.get('/class/:classId', authenticate, authorize(['ADMIN', 'TEACHER']), gradeController.fetchByClass);

/**
 * @swagger
 * /grades/student/{studentId}:
 *   get:
 *     summary: Fetch grades by student
 *     description: Retrieve all grades for a specific student with statistics and optional filtering
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
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
 *         description: Student grades retrieved successfully
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
 *                   example: Student grades retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     grades:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/GradeResponse'
 *                     statistics:
 *                       $ref: '#/components/schemas/GradeStatistics'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal server error
 */
router.get('/student/:studentId', authenticate, authorize(['ADMIN', 'TEACHER', 'PARENT']), gradeController.fetchByStudent);

/**
 * @swagger
 * /grades/subject/{subjectId}:
 *   get:
 *     summary: Fetch grades by subject
 *     description: Retrieve all grades for a specific subject with optional filtering
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: Filter by class ID
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
 *         description: Subject grades retrieved successfully
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
 *                   example: Subject grades retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GradeResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Teacher/Admin access required
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */
router.get('/subject/:subjectId', authenticate, authorize(['ADMIN', 'TEACHER']), gradeController.fetchBySubject);

/**
 * @swagger
 * /grades/{id}:
 *   put:
 *     summary: Update grade
 *     description: Update an existing grade record
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Grade ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGradeRequest'
 *           example:
 *             gradeValue: 92.0
 *             gradeType: EXAM
 *             description: Updated final exam grade
 *     responses:
 *       200:
 *         description: Grade updated successfully
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
 *                   example: Grade updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/GradeResponse'
 *       400:
 *         description: Bad request - Validation errors
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Teacher/Admin access required
 *       404:
 *         description: Grade not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, authorize(['ADMIN', 'TEACHER']), gradeController.updateGrade);

module.exports = router;