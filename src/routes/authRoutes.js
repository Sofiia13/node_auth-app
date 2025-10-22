const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware.js');
const router = express.Router();

router.post('/sign-up', authController.createUser);
router.get('/activate/:token', authController.activateAccount);
router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
