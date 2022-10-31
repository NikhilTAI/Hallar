const router = require('express').Router();

const authController = require('../../controllers/admin/authController');

router
    .route('/login')
    .get(authController.getLogin)
    .post(authController.postLogin);

router.get('/logout', authController.logout);

router.use(authController.checkAdmin);

router.get('/', authController.getDashboard);

router
    .route('/changepass')
    .get(authController.getChangePass)
    .post(authController.postChangePass);

module.exports = router;
