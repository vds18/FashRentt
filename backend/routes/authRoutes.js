
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Authentication
router.post("/register", register);
router.post("/login", login);

// Customer profile
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Delivery addresses
router.get("/addresses", protect, getAddresses);
router.post("/addresses", protect, addAddress);
router.put("/addresses/:addressId", protect, updateAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);

module.exports = router;