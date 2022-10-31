const mongoose = require('mongoose');
const validator = require('validator');

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
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
