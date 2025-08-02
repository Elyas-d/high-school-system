const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const userController = require('../controllers/userController');

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
router.get('/me', authenticate, userController.getCurrentUser);

module.exports = router; 