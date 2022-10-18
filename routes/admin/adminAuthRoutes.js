const router = require('express').Router();

const adminAuthController = require('../../controllers/admin/adminAuthController');

router.get(
    '/',
    adminAuthController.checkAdmin,
    adminAuthController.getDashboard
);

router
    .route('/login')
    .get(adminAuthController.getLogin)
    .post(adminAuthController.postLogin);

router.get('/logout', adminAuthController.logout);

module.exports = router;
