const express = require("express");
const router = express.Router();
const db = require("../db");
const redis = require("../redis");

router.get("/", async (req, res) => {
  try {
    await redis.set("health", "ok");

    const result = await db.query("SELECT NOW()");

    res.json({
      status: "ok",
      db_time: result.rows[0].now,
      cache: await redis.get("health"),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
