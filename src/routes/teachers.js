const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const teacherController = require('../controllers/teacherController');

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Teacher:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the teacher
 *         userId:
 *           type: integer
 *           description: Associated user ID
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
 *               enum: [TEACHER]
 *             phoneNumber:
 *               type: string
 *         Classes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               schedule:
 *                 type: string
 *               roomNumber:
 *                 type: string
 *               Subject:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *     CreateTeacherRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *           description: Teacher's first name
 *         lastName:
 *           type: string
 *           description: Teacher's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Teacher's email address
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Teacher's password
 *         phoneNumber:
 *           type: string
 *           description: Teacher's phone number
 *     UpdateTeacherRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           description: Teacher's first name
 *         lastName:
 *           type: string
 *           description: Teacher's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Teacher's email address
 *         phoneNumber:
 *           type: string
 *           description: Teacher's phone number
 *     AssignClassesRequest:
 *       type: object
 *       required:
 *         - classIds
 *       properties:
 *         classIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of class IDs to assign to the teacher
 */

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: List all teachers
 *     description: Retrieve a paginated list of teachers with optional filtering and search capabilities
 *     tags: [Teachers]
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
 *         description: Number of teachers per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for teacher name or email
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
 *         description: Teachers retrieved successfully
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
 *                   example: Teachers retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     teachers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Teacher'
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
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, authorize(['ADMIN']), teacherController.list);

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     summary: Get teacher by ID
 *     description: Retrieve a specific teacher by their ID with all related information including assigned classes
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Teacher retrieved successfully
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
 *                   example: Teacher retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, authorize(['ADMIN', 'TEACHER']), teacherController.getById);

/**
 * @swagger
 * /teachers:
 *   post:
 *     summary: Create a new teacher
 *     description: Create a new teacher account with user credentials
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTeacherRequest'
 *           example:
 *             firstName: Jane
 *             lastName: Smith
 *             email: jane.smith@school.com
 *             password: securePassword123
 *             phoneNumber: +1234567890
 *     responses:
 *       201:
 *         description: Teacher created successfully
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
 *                   example: Teacher created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: Bad request - Validation errors
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Conflict - Email already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, authorize(['ADMIN']), teacherController.create);

/**
 * @swagger
 * /teachers/{id}:
 *   put:
 *     summary: Update teacher information
 *     description: Update an existing teacher's information including user details
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Teacher ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTeacherRequest'
 *           example:
 *             firstName: Jane
 *             lastName: Johnson
 *             email: jane.johnson@school.com
 *             phoneNumber: +1234567890
 *     responses:
 *       200:
 *         description: Teacher updated successfully
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
 *                   example: Teacher updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: Bad request - Validation errors
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Teacher not found
 *       409:
 *         description: Conflict - Email already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, authorize(['ADMIN']), teacherController.update);

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     summary: Delete a teacher
 *     description: Delete a teacher and their associated user account permanently
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Teacher deleted successfully
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
 *                   example: Teacher deleted successfully
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, authorize(['ADMIN']), teacherController.delete);

/**
 * @swagger
 * /teachers/{id}/assign:
 *   post:
 *     summary: Assign classes to teacher
 *     description: Assign multiple classes to a specific teacher
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Teacher ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignClassesRequest'
 *           example:
 *             classIds: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Classes assigned to teacher successfully
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
 *                   example: Classes assigned to teacher successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     teacherId:
 *                       type: integer
 *                     classIds:
 *                       type: array
 *                       items:
 *                         type: integer
 *       400:
 *         description: Bad request - Invalid classIds format
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/assign', authenticate, authorize(['ADMIN']), teacherController.assignClasses);

/**
 * @swagger
 * /teachers/{id}/classes:
 *   get:
 *     summary: Get teacher's assigned classes
 *     description: Retrieve all classes assigned to a specific teacher
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Teacher classes retrieved successfully
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
 *                   example: Teacher classes retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       schedule:
 *                         type: string
 *                       roomNumber:
 *                         type: string
 *                       Subject:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/classes', authenticate, authorize(['ADMIN', 'TEACHER']), teacherController.getClasses);

module.exports = router;