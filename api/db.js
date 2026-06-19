const { Pool } = require("pg");

// Credentials use the same POSTGRES_* names the official postgres image
// initializes from, so the DB and the API share one source of truth.
// DB_HOST/DB_PORT only describe how to reach it (the compose service name).
const pool = new Pool({
  host: process.env.DB_HOST || "db",
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;
