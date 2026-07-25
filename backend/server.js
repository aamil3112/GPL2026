require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const registerRoutes = require("./routes/register");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", tournament: "Sagar Super Series 2026" });
});

app.use("/api/register", registerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Multer / general error handler
app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
    return res.status(400).json({ message: err.message || "Request failed" });
  }
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sagar Super Series 2026 API running on port ${PORT}`);
});
