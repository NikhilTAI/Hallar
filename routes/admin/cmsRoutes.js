const router = require('express').Router();

const cmsController = require('../../controllers/admin/cmsController');
const authController = require('../../controllers/admin/authController');

router.use(authController.checkAdmin);

router
    .route('/terms')
    .get(cmsController.getTerms)
    .post(cmsController.postTerms);

module.exports = router;
