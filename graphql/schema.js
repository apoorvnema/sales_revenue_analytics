const { buildSchema } = require('graphql');

module.exports = buildSchema(`    
    type Product {
        productId: ID!
        name: String!
        totalSold: Int!
    }

    type CategoryRevenue {
        category: String!
        revenue: Float!
    }

    type SalesAnalytics {
        totalRevenue: Float!
        completedOrders: Int!
        categoryBreakdown: [CategoryRevenue!]! 
    }

    type CustomerSpending {
        customerId: ID!
        totalSpent: Float!
        averageOrderValue: Float!
        lastOrderDate: String!
    }

    type ProductOrder {
        productId: ID!
        quantity: Int!
        priceAtPurchase: Float!
    }

    input ProductOrderInput {
        productId: ID!
        quantity: Int!
        priceAtPurchase: Float!
    }    

    type Order {
        _id: ID!
        customerId: ID!
        products: [ProductOrder]
        totalAmount: Float!
        status: String!
        orderDate: String!
    }

    type Query {
        getCustomerSpending(customerId: ID!): CustomerSpending
        getTopSellingProducts(limit: Int!): [Product]
        getSalesAnalytics(startDate: String!, endDate: String!): SalesAnalytics
        getCustomerOrders(page: Int!, limit: Int!): [Order]
    }

    type Mutation {
        createOrder(customerId: ID!, products: [ProductOrderInput!]!): Order
    }
`);