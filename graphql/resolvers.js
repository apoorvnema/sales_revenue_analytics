const analyticsController = require('../controllers/analyticsController');
const ordersController = require('../controllers/ordersController');

module.exports = {
    getCustomerSpending: analyticsController.getCustomerSpending,
    getTopSellingProducts: analyticsController.getTopSellingProducts,
    getSalesAnalytics: analyticsController.getSalesAnalytics,
    createOrder: ordersController.createOrder,
    getCustomerOrders: ordersController.getCustomerOrders
}
