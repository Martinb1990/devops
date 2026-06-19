const { createClient } = require("redis");

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: 6379,
  },
});

// Without an error listener an unreachable Redis throws an unhandled
// rejection at boot and can crash the process.
client.on("error", (err) => console.error("Redis error:", err.message));

// Skip auto-connect under test so the suite doesn't hang on an open
// reconnect handle; tests don't exercise the cache path.
if (process.env.NODE_ENV !== "test") {
  client.connect().catch((err) => {
    console.error("Redis connect failed:", err.message);
  });
}

module.exports = client;
