const { Router } = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authenticate');

const router = Router();

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/profile', authenticate, authController.profile);
router.post('/refresh', authController.refreshToken);

module.exports = router; 