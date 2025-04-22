const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const redisClient = require('../services/redisClient');

exports.getCustomerSpending = async (customerId) => {
  try {
    const cacheKey = `customer-spending-${customerId?.customerId}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const customerUUID = new mongoose.Types.UUID(customerId?.customerId);
    const result = await Order.aggregate([
      { $match: { customerId: customerUUID, status: 'completed' } },
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          lastOrderDate: { $max: '$orderDate' },
        },
      },
    ]);

    if (!result.length) return null;

    const finalResult = {
      customerId: customerUUID,
      totalSpent: result[0].totalSpent,
      averageOrderValue: result[0].averageOrderValue,
      lastOrderDate: result[0].lastOrderDate.toISOString(),
    };

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(finalResult));

    return finalResult;
  } catch (error) {
    console.error('Error getting customer spending:', error);
    throw error;
  }
};

exports.getTopSellingProducts = async (limit) => {
  try {
    const cacheKey = `top-selling-products-${limit?.limit || 5}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const orders = await Order.find({});

    let productMap = new Map();

    for (const order of orders) {
      let products = order.products;

      if (typeof products === 'string') {
        try {
          products = JSON.parse(products.replace(/'/g, '"'));
        } catch (err) {
          console.error('Invalid JSON in order:', order._id);
          continue;
        }
      }

      for (const item of products) {
        const productId = item.productId;
        const quantity = item.quantity || 0;

        if (!productMap.has(productId)) {
          productMap.set(productId, 0);
        }
        productMap.set(productId, productMap.get(productId) + quantity);
      }
    }

    const sorted = Array.from(productMap.entries())
      .map(([productId, totalSold]) => ({ productId, totalSold }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit?.limit || 10);

    const productDetails = await Product.find({
      _id: { $in: sorted.map(p => new mongoose.Types.UUID(p.productId)) }
    });

    const finalResult = sorted.map(p => {
      const prod = productDetails.find(d => d._id.toString() === p.productId);
      return {
        productId: new mongoose.Types.UUID(p.productId),
        name: prod?.name || 'Unknown Product',
        totalSold: p.totalSold
      };
    });

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(finalResult));

    return finalResult;
  } catch (error) {
    console.error('Error getting top selling products:', error);
    throw error;
  }
}

exports.getSalesAnalytics = async (date) => {
  try {
    const cacheKey = `sales-analytics-${date?.startDate}-${date?.endDate}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const startDate = new Date(date?.startDate).toISOString();
    const endDate = new Date(date?.endDate).toISOString();

    const orders = await Order.find({
      status: 'completed',
      orderDate: { $gte: startDate, $lte: endDate }
    });

    let totalRevenue = 0;
    let completedOrders = orders.length;
    let categoryRevenueMap = new Map();

    for (const order of orders) {
      let products = order.products;

      if (typeof products === 'string') {
        try {
          products = JSON.parse(products.replace(/'/g, '"'));
        } catch (err) {
          console.error('Invalid JSON in order:', order._id);
          continue;
        }
      }

      for (const item of products) {
        const productId = item.productId;
        const quantity = item.quantity || 0;
        const priceAtPurchase = item.priceAtPurchase || 0;
        totalRevenue += quantity * priceAtPurchase;
      }
    }

    const allProductIds = [
      ...new Set(
        orders.flatMap(order => {
          let products = order.products;
          if (typeof products === 'string') {
            try {
              products = JSON.parse(products.replace(/'/g, '"'));
            } catch {
              return [];
            }
          }
          return products.map(p => p.productId);
        })
      )
    ];

    const productDetails = await Product.find({
      _id: { $in: allProductIds.map(id => new mongoose.Types.UUID(id)) }
    });

    for (const order of orders) {
      let products = order.products;

      if (typeof products === 'string') {
        try {
          products = JSON.parse(products.replace(/'/g, '"'));
        } catch {
          continue;
        }
      }

      for (const item of products) {
        const productId = item.productId;
        const quantity = item.quantity || 0;
        const priceAtPurchase = item.priceAtPurchase || 0;

        const product = productDetails.find(p => p._id.toString() === productId);
        const category = product?.category || 'Unknown';

        if (!categoryRevenueMap.has(category)) {
          categoryRevenueMap.set(category, 0);
        }

        categoryRevenueMap.set(
          category,
          categoryRevenueMap.get(category) + quantity * priceAtPurchase
        );
      }
    }

    const categoryBreakdown = Array.from(categoryRevenueMap.entries()).map(
      ([category, revenue]) => ({
        category,
        revenue
      })
    );

    await redisClient.setEx(cacheKey, 3600, JSON.stringify({
      totalRevenue,
      completedOrders,
      categoryBreakdown
    }));

    return {
      totalRevenue,
      completedOrders,
      categoryBreakdown
    }
  }
  catch (error) {
    console.error('Error getting sales analytics:', error);
    throw error;
  }
}
