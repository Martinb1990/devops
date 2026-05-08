const { createClient } = require("redis");

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: 6379,
  },
});

client.connect();

module.exports = client;
