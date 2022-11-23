const mongoose = require('mongoose');
const validator = require('validator');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number.'],
        unique: true,
        validate(value) {
            if (!validator.isMobilePhone(value, 'any', { strictMode: true })) {
                throw new Error('Phone is invalid');
            }
        },
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
        type: String,
        default: 'default.jpg',
    },
    blocked: {
        type: Boolean,
        default: false,
        select: false,
        immutable: true,
    },
});

// generating tokens
userSchema.methods.generateAuthToken = async function () {
    try {
        return jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET, {
            expiresIn: '90d',
        });
    } catch (error) {
        throw createError.BadRequest(error);
    }
};

module.exports = new mongoose.model('User', userSchema);
