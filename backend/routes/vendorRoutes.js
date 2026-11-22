const express = require("express");
const router = express.Router();

const {
  registerVendor,
  loginVendor,
  getVendorProfile,
} = require("../controllers/vendorController");

const {
  protectVendor,
} = require("../middleware/vendorAuthMiddleware");

// Vendor registration
router.post("/register", registerVendor);

// Vendor login
router.post("/login", loginVendor);

// Protected vendor profile
router.get("/profile", protectVendor, getVendorProfile);

module.exports = router;