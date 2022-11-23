const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expireAt: {
        type: Date,
        expires: 0,
    },
});

module.exports = new mongoose.model('OTP', otpSchema);
