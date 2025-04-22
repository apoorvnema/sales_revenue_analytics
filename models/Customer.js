const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.UUID,
    name: String,
    email: String,
    age: Number,
    location: String,
    gender: String
});

module.exports = mongoose.model('Customer', CustomerSchema);