const router = require('express').Router();

const authController = require('../../controllers/api/authController');
const profileController = require('../../controllers/api/profileController');

router
    .route('/profile')
    .get(authController.checkUser, profileController.getProfile)
    .post(authController.checkUser, profileController.postProfile);

module.exports = router;
