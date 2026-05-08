const express = require("express");
const healthRoute = require("./routes/health");

const app = express();
app.use(express.json());

app.use("/health", healthRoute);

app.get("/", (req, res) => {
  res.send("API is running from PC workflow");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
