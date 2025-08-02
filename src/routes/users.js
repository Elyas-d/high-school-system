const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');

// Placeholder user controller
const userController = {
  list: (req, res) => res.json({ message: 'List users (admin only)' }),
  getById: (req, res) => res.json({ message: 'Get user by ID', id: req.params.id }),
  create: (req, res) => res.json({ message: 'Create user (admin only)' }),
  update: (req, res) => res.json({ message: 'Update user (admin only)', id: req.params.id }),
  delete: (req, res) => res.json({ message: 'Delete user (admin only)', id: req.params.id })
};

const router = Router();

// Public route - no authentication required
router.get('/public', (req, res) => {
  res.json({ message: 'Public user info' });
});

// Protected routes with authentication and authorization
router.get('/', authenticate, authorize(['ADMIN']), userController.list);
router.get('/:id', authenticate, authorize(['ADMIN', 'STAFF']), userController.getById);
router.post('/', authenticate, authorize(['ADMIN']), userController.create);
router.put('/:id', authenticate, authorize(['ADMIN']), userController.update);
router.delete('/:id', authenticate, authorize(['ADMIN']), userController.delete);

// User profile route - authenticated users can access their own profile
router.get('/me', authenticate, (req, res) => {
  res.json({ 
    message: 'User profile', 
    user: req.user 
  });
});

module.exports = router; 