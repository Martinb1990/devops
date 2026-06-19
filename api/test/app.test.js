const { test } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const app = require("../app");

test("GET / returns the running message", async () => {
  const res = await request(app).get("/");
  assert.strictEqual(res.status, 200);
  assert.match(res.text, /API is running/);
});

test("unknown route returns 404", async () => {
  const res = await request(app).get("/does-not-exist");
  assert.strictEqual(res.status, 404);
});
