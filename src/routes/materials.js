const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const materialController = require('../controllers/materialController');

const router = Router();

// Material routes with authentication and authorization
router.get('/', authenticate, authorize(['TEACHER', 'STUDENT']), materialController.list);
router.get('/:id', authenticate, authorize(['TEACHER', 'STUDENT']), materialController.getById);
router.post('/', authenticate, authorize(['TEACHER']), materialController.create);
router.put('/:id', authenticate, authorize(['TEACHER']), materialController.update);
router.delete('/:id', authenticate, authorize(['TEACHER']), materialController.delete);

module.exports = router; 