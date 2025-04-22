const mongoose = require('mongoose');
const Order = require('../models/Order');
const redisClient = require('../services/redisClient');

calculateTotalAmount = (products) => {
    return products.reduce((total, product) => {
        return total + (product.priceAtPurchase * product.quantity);
    }, 0);
}

exports.createOrder = async (new_order) => {
    try {
        let products = JSON.stringify(new_order?.products);
        let orderDate = new Date().toISOString();
        let totalAmount = calculateTotalAmount(new_order?.products);
        let status = 'pending';
        let customerId = new mongoose.Types.UUID(new_order?.customerId);
        const cacheKey = `customer-spending-${customerId}`;

        const order = new Order({
            customerId: customerId,
            products: products,
            totalAmount: totalAmount,
            status: status,
            orderDate: orderDate,
        });
        await order.save();
        await redisClient.del(cacheKey);

        return {
            _id: order._id,
            customerId: customerId,
            products: JSON.parse(products),
            totalAmount: totalAmount,
            status: status,
            orderDate: orderDate,
        };
    } catch (error) {
        return error.message;
    }
}

exports.getCustomerOrders = async (settings) => {
    try {
        const { page = 1, limit = 10 } = settings;
        const skip = (page - 1) * limit;

        const orders = await Order.find({})
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

        return (orders || []).map(order => ({
            _id: order._id,
            customerId: order.customerId,
            products: JSON.parse(order.products.replace(/'/g, '"')).map(product => ({
                productId: new mongoose.Types.UUID(product.productId),
                quantity: product.quantity,
                priceAtPurchase: product.priceAtPurchase,
            })),
            totalAmount: order.totalAmount,
            status: order.status,
            orderDate: order.orderDate.toISOString(),
        }));
    } catch (error) {
        throw new Error(error.message);
    }
};

