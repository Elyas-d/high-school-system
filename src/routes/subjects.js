const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const subjectController = require('../controllers/subjectController');

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateSubjectRequest:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           description: Subject name
 *         description:
 *           type: string
 *           description: Subject description
 *         credits:
 *           type: integer
 *           minimum: 1
 *           maximum: 6
 *           default: 3
 *           description: Number of credits for the subject
 *         department:
 *           type: string
 *           default: General
 *           description: Department the subject belongs to
 *     UpdateSubjectRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Updated subject name
 *         description:
 *           type: string
 *           description: Updated subject description
 *         credits:
 *           type: integer
 *           minimum: 1
 *           maximum: 6
 *           description: Updated number of credits
 *         department:
 *           type: string
 *           description: Updated department
 *     AssignTeacherRequest:
 *       type: object
 *       required:
 *         - teacherId
 *       properties:
 *         teacherId:
 *           type: integer
 *           description: ID of the teacher to assign
 *     SubjectResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the subject
 *         name:
 *           type: string
 *           description: Subject name
 *         description:
 *           type: string
 *           description: Subject description
 *         credits:
 *           type: integer
 *           description: Number of credits
 *         department:
 *           type: string
 *           description: Department name
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         Teachers:
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
 *               capacity:
 *                 type: integer
 */

/**
 * @swagger
 * /subjects:
 *   post:
 *     summary: Create new subject
 *     description: Create a new subject in the system (Admin only)
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubjectRequest'
 *           example:
 *             name: Mathematics
 *             description: Advanced mathematics course covering algebra, calculus, and statistics
 *             credits: 4
 *             department: Mathematics
 *     responses:
 *       201:
 *         description: Subject created successfully
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
 *                   example: Subject created successfully
 *                 data:
 *                   $ref: '#/components/schemas/SubjectResponse'
 *       400:
 *         description: Bad request - Validation errors or subject already exists
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, authorize(['ADMIN']), subjectController.create);

/**
 * @swagger
 * /subjects:
 *   get:
 *     summary: List all subjects
 *     description: Retrieve all subjects with optional filtering and pagination
 *     tags: [Subjects]
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
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for subject name or description
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: credits
 *         schema:
 *           type: integer
 *         description: Filter by number of credits
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, credits, department, createdAt]
 *           default: name
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully
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
 *                   example: Subjects retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     subjects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SubjectResponse'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, subjectController.list);

/**
 * @swagger
 * /subjects/{id}:
 *   get:
 *     summary: Get subject by ID
 *     description: Retrieve a specific subject with its teachers and classes
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject retrieved successfully
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
 *                   example: Subject retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/SubjectResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, subjectController.getById);

/**
 * @swagger
 * /subjects/{id}:
 *   put:
 *     summary: Update subject
 *     description: Update an existing subject (Admin only)
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSubjectRequest'
 *           example:
 *             name: Advanced Mathematics
 *             description: Updated course description
 *             credits: 5
 *     responses:
 *       200:
 *         description: Subject updated successfully
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
 *                   example: Subject updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/SubjectResponse'
 *       400:
 *         description: Bad request - Validation errors or name conflict
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, authorize(['ADMIN']), subjectController.update);

/**
 * @swagger
 * /subjects/{id}:
 *   delete:
 *     summary: Delete subject
 *     description: Delete a subject from the system (Admin only)
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject deleted successfully
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
 *                   example: Subject deleted successfully
 *       400:
 *         description: Bad request - Subject has associated classes
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, authorize(['ADMIN']), subjectController.delete);

/**
 * @swagger
 * /subjects/{id}/teachers:
 *   post:
 *     summary: Assign teacher to subject
 *     description: Assign a teacher to teach a specific subject (Admin only)
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignTeacherRequest'
 *           example:
 *             teacherId: 5
 *     responses:
 *       200:
 *         description: Teacher assigned to subject successfully
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
 *                   example: Teacher assigned to subject successfully
 *       400:
 *         description: Bad request - Teacher already assigned or missing teacherId
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Subject or teacher not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/teachers', authenticate, authorize(['ADMIN']), subjectController.assignTeacher);

/**
 * @swagger
 * /subjects/{id}/teachers/{teacherId}:
 *   delete:
 *     summary: Remove teacher from subject
 *     description: Remove a teacher's assignment from a specific subject (Admin only)
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Teacher removed from subject successfully
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
 *                   example: Teacher removed from subject successfully
 *       400:
 *         description: Bad request - Teacher not assigned to this subject
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Subject or teacher not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/teachers/:teacherId', authenticate, authorize(['ADMIN']), subjectController.removeTeacher);

module.exports = router;