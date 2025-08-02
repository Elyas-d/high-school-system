const { Router } = require('express');

// Placeholder example controller
const exampleController = {
  validateUser: (req, res) => res.json({ message: 'Validate user (example)' }),
  requireAuth: (req, res) => res.json({ message: 'Require auth (example)' }),
  requireAdmin: (req, res) => res.json({ message: 'Require admin (example)' }),
  getUserById: (req, res) => res.json({ message: 'Get user by ID (example)', id: req.params.id }),
  createUser: (req, res) => res.json({ message: 'Create user (example)' }),
  updateUser: (req, res) => res.json({ message: 'Update user (example)', id: req.params.id }),
  simulateError: (req, res) => res.json({ message: 'Simulate error (example)' })
};

const router = Router();

router.post('/validate', exampleController.validateUser);
router.get('/auth', exampleController.requireAuth);
router.get('/admin', exampleController.requireAdmin);
router.get('/users/:id', exampleController.getUserById);
router.post('/users', exampleController.createUser);
router.put('/users/:id', exampleController.updateUser);
router.get('/error', exampleController.simulateError);

module.exports = router; 