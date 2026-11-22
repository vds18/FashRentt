const express = require("express");
const router = express.Router();

const {
  getApprovedOutfits,
  getOutfitById,
  createVendorOutfit,
  getVendorOutfits,
  updateVendorOutfit,
  toggleVendorOutfitAvailability,
  deleteVendorOutfit,
} = require("../controllers/outfitController");

const {
  protectVendor,
} = require("../middleware/vendorAuthMiddleware");

// Vendor routes
router.post("/vendor", protectVendor, createVendorOutfit);

router.get("/vendor", protectVendor, getVendorOutfits);

router.put(
  "/vendor/:id",
  protectVendor,
  updateVendorOutfit
);

router.patch(
  "/vendor/:id/availability",
  protectVendor,
  toggleVendorOutfitAvailability
);

router.delete(
  "/vendor/:id",
  protectVendor,
  deleteVendorOutfit
);

// Public customer routes
router.get("/", getApprovedOutfits);

router.get("/:id", getOutfitById);

module.exports = router;