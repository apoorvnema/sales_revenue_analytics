const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.UUID,
    name: String,
    category: String,
    price: Number,
    stock: Number
});

module.exports = mongoose.model('Product', ProductSchema);