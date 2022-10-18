const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const Admin = require('../../models/adminModel');

exports.checkAdmin = async (req, res, next) => {
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
};

exports.getDashboard = async (req, res) => {
    res.render('index', { photo: req.admin.photo });
};

exports.getLogin = async (req, res) => {
    try {
        if (req.session.checkAdminSuccess) {
            req.session.checkAdminSuccess = undefined;
            return res.render('login');
        }
        const token = req.cookies['jwtAdmin'];
        if (token) {
            jwt.verify(
                token,
                process.env.JWT_SECRET,
                function (err, decodedToken) {
                    if (err) {
                        return res.render('login');
                    } else {
                        Admin.findById(decodedToken._id, function (err, admin) {
                            if (err) {
                                return res.render('login');
                            }
                            if (!admin) {
                                return res.render('login');
                            }
                            return res.redirect('/');
                        });
                    }
                }
            );
        } else {
            return res.render('login');
        }
    } catch (error) {
        console.log(error);
        req.flash('red', error.message);
        res.send(error);
    }
};

exports.postLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email }).select('+password');

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
        console.log(error);
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
};

exports.logout = async (req, res) => {
    res.clearCookie('jwtAdmin');
    res.redirect('/login');
};
