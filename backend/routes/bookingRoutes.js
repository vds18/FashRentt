const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { protectVendor } = require("../middleware/vendorAuthMiddleware");

const {
  createBooking,
  getMyBookings,
  getBookingDetails,
  cancelBooking,
  dispatchVendorOrder,
  getVendorBookings,
  updateVendorBookingStatus,
  checkAvailability,
} = require("../controllers/bookingController");

// ==========================================
// VENDOR ROUTES
// ==========================================
// Vendor dispatch order with tracking ID
router.patch(
  "/vendor/orders/:id/dispatch",
  protectVendor,
  dispatchVendorOrder
);
router.get("/check-availability", checkAvailability);
router.get(
  "/vendor/orders",
  protectVendor,
  getVendorBookings
);

router.patch(
  "/vendor/orders/:id/status",
  protectVendor,
  updateVendorBookingStatus
);

// ==========================================
// CUSTOMER ROUTES
// ==========================================

router.post("/", protect, createBooking);

router.get("/my-bookings", protect, getMyBookings);

router.patch("/:id/cancel", protect, cancelBooking);

router.get("/:id", protect, getBookingDetails);

module.exports = router;