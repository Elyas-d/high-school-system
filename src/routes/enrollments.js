const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');
const enrollmentController = require('../controllers/enrollmentController');

const router = Router();

// Enroll students in a class
router.post('/', authenticate, authorize(['ADMIN', 'TEACHER']), enrollmentController.create);

// List all enrollments
router.get('/', authenticate, authorize(['ADMIN', 'STAFF', 'TEACHER']), enrollmentController.list);

module.exports = router;
