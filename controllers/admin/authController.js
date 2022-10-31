const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const Admin = require('../../models/adminModel');

exports.checkAdmin = async (req, res, next) => {
    try {
        const token = req.cookies['jwtAdmin'];
        req.session.checkAdminSuccess = true;
        if (token) {
            const decoded = await promisify(jwt.verify)(
                token,
                process.env.JWT_SECRET
            );
            const admin = await Admin.findById(decoded._id);
            if (!admin) {
                req.flash('red', 'Please login as admin first!');
                return res.redirect('/login');
            }
            req.admin = admin;
            req.session.checkAdminSuccess = undefined;
            next();
        } else {
            req.flash('red', 'Please login as admin first!');
            res.redirect('/login');
        }
    } catch (error) {
        if (error.message == 'invalid signature')
            req.flash('red', 'Invalid token! Please login again.');
        else req.flash('red', error.message);
        res.redirect('/login');
    }
};

exports.getDashboard = async (req, res) => {
    try {
        res.render('index', { photo: req.admin.photo });
    } catch (error) {
        res.send(error.message);
    }
};

exports.getLogin = async (req, res) => {
    try {
        if (req.session.checkAdminSuccess) {
            req.session.checkAdminSuccess = undefined;
            return res.render('login');
        }

        const token = req.cookies['jwtAdmin'];
        if (token) {
            const decoded = await promisify(jwt.verify)(
                token,
                process.env.JWT_SECRET
            );
            const admin = await Admin.findById(decoded._id);
            if (!admin) return res.render('login');

            res.redirect('/');
        } else {
            res.render('login');
        }
    } catch (error) {
        req.flash('red', error.message);
        res.render('login');
    }
};

exports.postLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (
            !admin ||
            !(await admin.correctPassword(password, admin.password))
        ) {
            req.flash('red', 'Incorrect email or password');
            return res.redirect(req.originalUrl);
        }

        const token = await admin.generateAuthToken();
        res.cookie('jwtAdmin', token, {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        });
        res.redirect('/');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
};

exports.logout = async (req, res) => {
    res.clearCookie('jwtAdmin');
    res.redirect('/login');
};

exports.getChangePass = async (req, res) => {
    res.render('change_pass', { photo: req.admin.photo });
};

exports.postChangePass = async (req, res) => {
    try {
        const { currentpass, newpass, cfnewpass } = req.body;

        if (currentpass == newpass) {
            req.flash(
                'red',
                'New password can not be same as current password.'
            );
            return res.redirect(req.originalUrl);
        }

        const admin = await Admin.findOne();

        if (!(await admin.correctPassword(currentpass, admin.password))) {
            req.flash('red', 'Your current password is wrong.');
            return res.redirect(req.originalUrl);
        }

        admin.password = newpass;
        admin.passwordConfirm = cfnewpass;
        await admin.save();

        req.flash('green', 'Password updated.');
        return res.redirect(req.originalUrl);
    } catch (error) {
        if (error.name === 'ValidationError') {
            Object.keys(error.errors).forEach(key => {
                req.flash('red', error.errors[key].message);
            });
        } else {
            req.flash('red', error.message);
        }
        return res.redirect(req.originalUrl);
    }
};
