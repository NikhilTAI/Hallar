const router = require('express').Router();

const userController = require('../../controllers/api/userController');

router.get('/terms', userController.getTerms);

router.get('/subscription', userController.getSubscriptions);

module.exports = router;
