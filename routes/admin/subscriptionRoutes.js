const router = require('express').Router();

const subscriptionController = require('../../controllers/admin/subscriptionController');
const authController = require('../../controllers/admin/authController');

// multer
const multer = require('multer');
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10,
    },
    fileFilter: fileFilter,
});

router.use(authController.checkAdmin);

router.get('/', subscriptionController.getAllSubscriptions);

router
    .route('/add')
    .get(subscriptionController.getAddSubscription)
    .post(upload.single('image'), subscriptionController.postAddSubscription);

router
    .route('/edit/:id')
    .get(subscriptionController.getEditSubscription)
    .post(upload.single('image'), subscriptionController.postEditSubscription);

router.get('/delete/:id', subscriptionController.deleteSubscription);

module.exports = router;
