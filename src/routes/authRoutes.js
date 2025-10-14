const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/sign-up', authController.createUser);
router.get('/activate/:token', authController.activateAccount);

// router.post('/sign-up', authController.createUser);

module.exports = router;
