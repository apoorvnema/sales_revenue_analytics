# Sales Revenue Analytics

This is a Node.js backend project designed to provide sales revenue analytics using GraphQL, with support for Redis caching.

## 📁 Project Structure

- `controllers/` – Contains logic for analytics and order-related routes.
- `graphql/` – GraphQL schema and resolvers.
- `models/` – Mongoose models for `Customer`, `Order`, and `Product`.
- `services/` – Includes Redis client service.
- `queries.graphql` – Sample GraphQL queries.
- `app.js` – Entry point of the application.

## 🚀 Features

- GraphQL API for managing and analyzing sales data.
- Redis caching for improved performance.
- Modular and scalable architecture.

## 🛠️ Prerequisites

- Node.js (v14+ recommended)
- npm or yarn
- MongoDB (running locally or hosted)
- Redis (running locally or hosted)

## ⚙️ Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <your-repo-url>
   cd sales_revenue_analytics
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Environment File**
   Create a `.env` file in the root directory with the following:
   ```
   MONGO_URI=mongodb://localhost:27017/your-db-name
   REDIS_URL=redis://localhost:6379
   PORT=4000
   ```

4. **Run the App**
   ```bash
   npm start
   ```

5. **Access GraphQL Playground**
   Open your browser at [http://localhost:4000/graphql](http://localhost:4000/graphql)

## 🧪 Example Query

```graphql
query {
  getAllOrders {
    id
    total
    customer {
      name
    }
  }
}
```

## 📦 Package Scripts

- `npm start` – Start the server.
- `npm run dev` – Start the server with nodemon (if configured).
