const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const studentController = require('../controllers/studentController');

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the student
 *         userId:
 *           type: integer
 *           description: Associated user ID
 *         gradeLevelId:
 *           type: integer
 *           description: Grade level ID
 *         classId:
 *           type: integer
 *           description: Class ID (optional)
 *         User:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *               enum: [STUDENT]
 *             phoneNumber:
 *               type: string
 *         GradeLevel:
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
 *         Parents:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               User:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *     CreateStudentRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - gradeLevelId
 *       properties:
 *         firstName:
 *           type: string
 *           description: Student's first name
 *         lastName:
 *           type: string
 *           description: Student's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Student's email address
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Student's password
 *         phoneNumber:
 *           type: string
 *           description: Student's phone number
 *         gradeLevelId:
 *           type: integer
 *           description: Grade level ID
 *         classId:
 *           type: integer
 *           description: Class ID (optional)
 *         parentIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of parent IDs to associate with the student
 *     UpdateStudentRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           description: Student's first name
 *         lastName:
 *           type: string
 *           description: Student's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Student's email address
 *         phoneNumber:
 *           type: string
 *           description: Student's phone number
 *         gradeLevelId:
 *           type: integer
 *           description: Grade level ID
 *         classId:
 *           type: integer
 *           description: Class ID
 *         parentIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of parent IDs to associate with the student
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *         timestamp:
 *           type: string
 *           format: date-time
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: List all students
 *     description: Retrieve a paginated list of students with optional filtering and search capabilities
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of students per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for student name or email
 *       - in: query
 *         name: gradeLevel
 *         schema:
 *           type: integer
 *         description: Filter by grade level ID
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: Filter by class ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, firstName, lastName, email]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Students retrieved successfully
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
 *                   example: Students retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Student'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalCount:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrevious:
 *                           type: boolean
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticate, authorize(['ADMIN', 'TEACHER', 'STAFF']), studentController.list);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student by ID
 *     description: Retrieve a specific student by their ID with all related information
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student retrieved successfully
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
 *                   example: Student retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authenticate, authorize(['ADMIN', 'TEACHER', 'STAFF']), studentController.getById);

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a new student
 *     description: Create a new student account with user credentials and associate with grade level and optional class
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentRequest'
 *           example:
 *             firstName: John
 *             lastName: Doe
 *             email: john.doe@student.school.com
 *             password: securePassword123
 *             phoneNumber: +1234567890
 *             gradeLevelId: 1
 *             classId: 5
 *             parentIds: [1, 2]
 *     responses:
 *       201:
 *         description: Student created successfully
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
 *                   example: Student created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Bad request - Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict - Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticate, authorize(['ADMIN']), studentController.create);

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update student information
 *     description: Update an existing student's information including user details and associations
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStudentRequest'
 *           example:
 *             firstName: John
 *             lastName: Smith
 *             email: john.smith@student.school.com
 *             phoneNumber: +1234567890
 *             gradeLevelId: 2
 *             classId: 8
 *             parentIds: [1, 3]
 *     responses:
 *       200:
 *         description: Student updated successfully
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
 *                   example: Student updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Bad request - Validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict - Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', authenticate, authorize(['ADMIN', 'TEACHER']), studentController.update);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete a student
 *     description: Delete a student and their associated user account permanently
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student deleted successfully
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
 *                   example: Student deleted successfully
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authenticate, authorize(['ADMIN']), studentController.delete);

module.exports = router;