const app = require("./app");
const db = require("./db");
const redis = require("./redis");

const server = app.listen(3000, () => {
  console.log("Server running on port 3000");
});

// Graceful shutdown: stop accepting requests, then close backing
// connections so `docker compose down` doesn't drop in-flight work.
async function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    try {
      await db.end();
      await redis.quit();
    } catch (err) {
      console.error("Error during shutdown:", err.message);
    } finally {
      process.exit(0);
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
