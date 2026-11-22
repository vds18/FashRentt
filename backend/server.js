
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const outfitRoutes = require("./routes/outfitRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/outfits", outfitRoutes);
app.use("/api/bookings", bookingRoutes);
app.get("/api/bookings/test-route", (req, res) => {
  res.json({ success: true, message: "Booking route is working" });
});

// Main API route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to FashRentt API!",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FashRentt backend is running",
  });
});

// Connect database and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Atlas connected successfully");

    app.listen(PORT, () => {
      console.log(`FashRentt server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();