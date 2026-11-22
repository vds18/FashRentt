const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  getAllVendors,
  updateVendorStatus,
  getAllOutfits,
  updateOutfitStatus,
} = require("../controllers/adminController");

// Vendor routes
router.get("/vendors", protect, admin, getAllVendors);

router.patch(
  "/vendors/:id/status",
  protect,
  admin,
  updateVendorStatus
);

// Outfit routes
router.get("/outfits", protect, admin, getAllOutfits);

router.patch(
  "/outfits/:id/status",
  protect,
  admin,
  updateOutfitStatus
);

module.exports = router;