const mongoose = require('mongoose');

const pageSchema = mongoose.Schema({
    title: {
        type: String,
        unique: true,
    },
    en: { content: String },
    fr: { content: String },
});

module.exports = new mongoose.model('Page', pageSchema);
