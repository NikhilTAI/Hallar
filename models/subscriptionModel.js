const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema({
    en: {
        description: String,
    },
    fr: {
        description: String,
    },
    price: String,
    validity: String,
    period: String,
    image: String,
});

module.exports = new mongoose.model('Subscription', subscriptionSchema);
