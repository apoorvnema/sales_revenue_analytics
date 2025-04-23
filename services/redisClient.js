const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        return new Error('Max retries reached');
      }
      return Math.min(retries * 100, 500);
    },
  },
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

(async () => {
  try {
    await redisClient.connect();
  }
  catch (err) {
    console.error('Error connecting to Redis:', err);
  }
})();

module.exports = redisClient;
