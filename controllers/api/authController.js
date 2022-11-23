const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const validator = require('validator');
const { sendOtp } = require('../../utils/sendSms');

const User = require('../../models/userModel');
const OTP = require('../../models/otpModel');

// generate random code
const generateCode = length => {
    var digits = '0123456789';
    let generated = '';
    for (let i = 0; i < length; i++)
        generated += digits[Math.floor(Math.random() * 10)];
    return generated;
};

exports.checkUser = async (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        if (!token) return next(createError.BadRequest('no token'));

        const decoded = await promisify(jwt.verify)(
            token,
            process.env.JWT_SECRET
        );
        const user = await User.findById(decoded._id).select('+blocked -__v');

        if (!user) return next(createError.BadRequest('no user'));
        if (user.blocked) return next(createError.BadRequest('user blocked'));

        req.user = user;
        next();
    } catch (error) {
        console.log(error.message);
        next(createError.BadRequest('login'));
    }
};

exports.getOtp = async (req, res, next) => {
    try {
        const phone = req.body.phone;
        // check if phone is invalid
        if (!validator.isMobilePhone(phone, 'any', { strictMode: true }))
            return next(createError.BadRequest('Invalid phone number.'));

        // generate and save
        const otp = generateCode(6);
        await OTP.updateOne(
            { phone },
            { otp, expireAt: Date.now() + 5 * 60 * 1000 },
            { upsert: true }
        );

        // send otp
        await sendOtp(phone, otp);
        res.json({ status: 'success', message: 'Otp sent to your number.' });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { phone, otp } = req.body;

        // verify otp
        const otpVerified = await OTP.findOne({ phone, otp });
        if (!otpVerified)
            return next(createError.BadRequest('Fail to verify OTP.'));

        const userExist = await User.findOne({ phone });
        if (!userExist) {
            // token to verify that number is verified
            const token = jwt.sign({ phone }, process.env.JWT_SECRET, {
                expiresIn: '1d',
            });
            return res.json({
                status: 'fail',
                message: 'Phone number not registered.',
                token,
            });
        }

        const token = await userExist.generateAuthToken();
        res.json({ status: 'success', token });
    } catch (error) {
        next(error);
    }
};

exports.register = async (req, res, next) => {
    try {
        // verify token & phone
        const decoded = await promisify(jwt.verify)(
            req.body.token,
            process.env.JWT_SECRET
        );
        if (!decoded.phone || decoded.phone !== req.body.phone)
            return next(createError.BadRequest('please verify phone'));

        // create user
        const user = await User.create(req.body); // req.body is temp
        const token = await user.generateAuthToken();
        res.json({ status: 'success', token, user });
    } catch (error) {
        next(error);
    }
};
