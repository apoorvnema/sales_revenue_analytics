const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const OrderSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.UUID,
        default: () => uuidv4()
    },
    customerId: mongoose.Schema.Types.UUID,
    products: String,
    productsFixed: {
        type: [{
            productId: mongoose.Schema.Types.UUID,
            quantity: Number,
            priceAtPurchase: Number
        }],
        default: []
    },
    totalAmount: Number,
    orderDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'canceled', 'completed'],
        default: 'pending'
    }
});

module.exports = mongoose.model('Order', OrderSchema);
