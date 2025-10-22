const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/sign-up', authController.createUser);
router.get('/activate/:token', authController.activateAccount);
router.post('/login', authController.login);

module.exports = router;
