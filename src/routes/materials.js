const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const materialController = require('../controllers/materialController');

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Material:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Material ID
 *         title:
 *           type: string
 *           description: Material title
 *         description:
 *           type: string
 *           description: Material description
 *         type:
 *           type: string
 *           enum: [DOCUMENT, VIDEO, AUDIO, IMAGE, LINK]
 *           description: Type of material
 *         url:
 *           type: string
 *           description: URL or file path to the material
 *         subjectId:
 *           type: integer
 *           description: Associated subject ID
 *         teacherId:
 *           type: integer
 *           description: Teacher who uploaded the material
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     MaterialRequest:
 *       type: object
 *       required:
 *         - title
 *         - type
 *         - url
 *         - subjectId
 *       properties:
 *         title:
 *           type: string
 *           example: Introduction to Algebra
 *         description:
 *           type: string
 *           example: Basic algebraic concepts and operations
 *         type:
 *           type: string
 *           enum: [DOCUMENT, VIDEO, AUDIO, IMAGE, LINK]
 *           example: DOCUMENT
 *         url:
 *           type: string
 *           example: /uploads/algebra-intro.pdf
 *         subjectId:
 *           type: integer
 *           example: 1
 */

/**
 * @swagger
 * /materials:
 *   get:
 *     summary: List all materials
 *     description: Retrieve a list of educational materials (Teachers and Students only)
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of materials per page
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: integer
 *         description: Filter by subject ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [DOCUMENT, VIDEO, AUDIO, IMAGE, LINK]
 *         description: Filter by material type
 *     responses:
 *       200:
 *         description: Materials retrieved successfully
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
 *                   example: Materials retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     materials:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Material'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, authorize(['TEACHER', 'STUDENT']), materialController.list);

/**
 * @swagger
 * /materials/{id}:
 *   get:
 *     summary: Get material by ID
 *     description: Retrieve a specific educational material by its ID (Teachers and Students only)
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material retrieved successfully
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
 *                   example: Material retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     material:
 *                       $ref: '#/components/schemas/Material'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Material not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, authorize(['TEACHER', 'STUDENT']), materialController.getById);

/**
 * @swagger
 * /materials:
 *   post:
 *     summary: Create new material
 *     description: Upload or create a new educational material (Teachers only)
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaterialRequest'
 *     responses:
 *       201:
 *         description: Material created successfully
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
 *                   example: Material created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     material:
 *                       $ref: '#/components/schemas/Material'
 *       400:
 *         description: Bad request - validation errors
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - Teachers only
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, authorize(['TEACHER']), materialController.create);

/**
 * @swagger
 * /materials/{id}:
 *   put:
 *     summary: Update material
 *     description: Update an existing educational material (Teachers only)
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Material ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaterialRequest'
 *     responses:
 *       200:
 *         description: Material updated successfully
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
 *                   example: Material updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     material:
 *                       $ref: '#/components/schemas/Material'
 *       400:
 *         description: Bad request - validation errors
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - Teachers only
 *       404:
 *         description: Material not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, authorize(['TEACHER']), materialController.update);

/**
 * @swagger
 * /materials/{id}:
 *   delete:
 *     summary: Delete material
 *     description: Delete an educational material (Teachers only)
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material deleted successfully
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
 *                   example: Material deleted successfully
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - Teachers only
 *       404:
 *         description: Material not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, authorize(['TEACHER']), materialController.delete);

module.exports = router;