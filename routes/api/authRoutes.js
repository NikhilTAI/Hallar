const router = require('express').Router();

const authController = require('../../controllers/api/authController');

router.post('/get-otp', authController.getOtp);

router.post('/login', authController.login);

router.post('/register', authController.register);

module.exports = router;
