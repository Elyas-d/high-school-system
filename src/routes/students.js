const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const studentController = require('../controllers/studentController');

const router = Router();

// Student routes with authentication and authorization
router.get('/', authenticate, authorize(['ADMIN', 'TEACHER', 'STAFF']), studentController.list);
router.get('/:id', authenticate, authorize(['ADMIN', 'TEACHER', 'STAFF']), studentController.getById);
router.post('/', authenticate, authorize(['ADMIN']), studentController.create);
router.put('/:id', authenticate, authorize(['ADMIN', 'TEACHER']), studentController.update);
router.delete('/:id', authenticate, authorize(['ADMIN']), studentController.delete);

module.exports = router; 