import { Router } from 'express';
import { ExampleController } from '../controllers/example.controller';

const router = Router();
const exampleController = new ExampleController();

/**
 * @swagger
 * /api/example/validate:
 *   post:
 *     summary: Validate user input
 *     description: Example endpoint that demonstrates validation error handling
 *     tags: [Example]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *               age:
 *                 type: number
 *                 example: 25
 *     responses:
 *       200:
 *         description: Validation successful
 *       422:
 *         description: Validation failed
 */
router.post('/validate', exampleController.validateUser);

/**
 * @swagger
 * /api/example/auth:
 *   get:
 *     summary: Test authentication
 *     description: Example endpoint that demonstrates authentication error handling
 *     tags: [Example]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authentication successful
 *       401:
 *         description: Authentication failed
 */
router.get('/auth', exampleController.requireAuth);

/**
 * @swagger
 * /api/example/admin:
 *   get:
 *     summary: Test admin access
 *     description: Example endpoint that demonstrates authorization error handling
 *     tags: [Example]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin access granted
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get('/admin', exampleController.requireAdmin);

/**
 * @swagger
 * /api/example/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Example endpoint that demonstrates not found error handling
 *     tags: [Example]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get('/users/:id', exampleController.getUserById);

/**
 * @swagger
 * /api/example/users:
 *   post:
 *     summary: Create user
 *     description: Example endpoint that demonstrates conflict error handling
 *     tags: [Example]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "newuser@example.com"
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: User already exists
 */
router.post('/users', exampleController.createUser);

/**
 * @swagger
 * /api/example/users/{id}:
 *   put:
 *     summary: Update user
 *     description: Example endpoint that demonstrates bad request error handling
 *     tags: [Example]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad request
 */
router.put('/users/:id', exampleController.updateUser);

/**
 * @swagger
 * /api/example/error:
 *   get:
 *     summary: Simulate errors
 *     description: Example endpoint that demonstrates different error types
 *     tags: [Example]
 *     parameters:
 *       - in: query
 *         name: errorType
 *         schema:
 *           type: string
 *           enum: [database, external, validation]
 *         description: Type of error to simulate
 *     responses:
 *       500:
 *         description: Internal server error
 *       503:
 *         description: Service unavailable
 *       422:
 *         description: Validation error
 */
router.get('/error', exampleController.simulateError);

export default router; 