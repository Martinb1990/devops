const express = require("express");
const pinoHttp = require("pino-http");
const healthRoute = require("./routes/health");

const app = express();

// Structured request logging (one JSON line per request).
app.use(pinoHttp());
app.use(express.json());

app.use("/health", healthRoute);

app.get("/", (req, res) => {
  res.send("API is running from PC workflow");
});

// Centralized error handler so thrown/forwarded errors return JSON
// instead of leaking stack traces or hanging the request.
app.use((err, req, res, next) => {
  req.log.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
