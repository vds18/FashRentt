
const crypto = require("crypto");
const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Outfit = require("../models/Outfit");
const Vendor = require("../models/Vendor");

// ==========================================
// 1. CREATE A NEW BOOKING
// ==========================================

exports.createBooking = async (req, res) => {
  try {
    const {
      outfitId,
      color,
      size,
      rentalStartDate,
      rentalEndDate,
      deliveryAddress,
    } = req.body;

    // Validate required fields
    if (
      !outfitId ||
      !color ||
      !size ||
      !rentalStartDate ||
      !rentalEndDate ||
      !deliveryAddress
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all booking details.",
      });
    }

    // Validate outfit ID
    if (!mongoose.Types.ObjectId.isValid(outfitId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid outfit ID.",
      });
    }

    // Find approved and available outfit
    const outfit = await Outfit.findOne({
      _id: outfitId,
      status: "approved",
      available: true,
    });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: "Outfit is unavailable.",
      });
    }

    // Check vendor approval
    const vendor = await Vendor.findOne({
      _id: outfit.vendor,
      status: "approved",
    });

    if (!vendor) {
      return res.status(400).json({
        success: false,
        message: "This vendor is not currently approved.",
      });
    }

    // Validate rental dates
    const startDate = new Date(rentalStartDate);
    const endDate = new Date(rentalEndDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid rental dates.",
      });
    }

    if (startDate < today || endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: "Please select valid future rental dates.",
      });
    }

    // Validate selected size
    const selectedSize = outfit.sizes.find(
      (item) => item.size === size
    );

    if (!selectedSize || selectedSize.quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Selected size is unavailable.",
      });
    }
    const selectedColor = outfit.color?.some(
  (item) =>
    String(item).trim().toLowerCase() ===
    String(color).trim().toLowerCase()
);

if (!selectedColor) {
  return res.status(400).json({
    success: false,
    message: "Selected color is unavailable.",
  });
}
// Check date-based availability for the selected size
// FashRentt keeps a 10-day buffer after every rental
// for pickup, return, cleaning, inspection, and preparation.

const requestedStartDate = new Date(startDate);

const requestedEndWithBuffer = new Date(endDate);
requestedEndWithBuffer.setDate(
  requestedEndWithBuffer.getDate() + 10
);

// Get bookings that are still occupying inventory
const overlappingBookings = await Booking.find({
  outfit: outfit._id,
  size: size,

  bookingStatus: {
    $in: [
      "confirmed",
      "preparing",
      "dispatched",
      "delivered",
      "return_requested",
    ],
  },

  // Existing booking must start before
  // the requested rental + 10-day buffer ends
  rentalStartDate: {
    $lt: requestedEndWithBuffer,
  },
});

// Check each existing booking's own 10-day buffer
const conflictingBookings = overlappingBookings.filter(
  (booking) => {
    const existingAvailableDate = new Date(
      booking.rentalEndDate
    );

    existingAvailableDate.setDate(
      existingAvailableDate.getDate() + 10
    );

    // Existing outfit is still occupied when
    // the new customer wants to start
    return existingAvailableDate > requestedStartDate;
  }
);

// Count how many units of this size are occupied
const bookedQuantity = conflictingBookings.length;

// Compare with the available quantity of this size
if (bookedQuantity >= selectedSize.quantity) {
  return res.status(409).json({
    success: false,
    message:
      "This outfit size is unavailable for the selected dates. Please choose different dates.",
  });
}
    // Validate rental duration
    const days = Math.ceil(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );

    if (days !== outfit.rentalDuration) {
      return res.status(400).json({
        success: false,
        message: `This outfit can be rented for ${outfit.rentalDuration} days.`,
      });
    }

    // Calculate booking amount
    const rentalPrice = outfit.rentalPrice;
    const securityDeposit = outfit.securityDeposit;
    const deliveryFee = 0;

    const totalAmount =
      rentalPrice + securityDeposit + deliveryFee;

    // Create booking
    const booking = await Booking.create({
      bookingId: `FR-${Date.now()}-${crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase()}`,

      customer: req.user._id,
      outfit: outfit._id,
      vendor: vendor._id,

      color,
      size,
      rentalStartDate: startDate,
      rentalEndDate: endDate,

      rentalPrice,
      securityDeposit,
      deliveryFee,
      totalAmount,

      deliveryAddress,

      paymentStatus: "pending",
      bookingStatus: "confirmed",
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create booking.",
      error: error.message,
    });
  }
};


// ==========================================
// 2. GET ALL BOOKINGS FOR LOGGED-IN CUSTOMER
// ==========================================

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customer: req.user._id,
    })
      .populate(
        "outfit",
        "title name images rentalPrice securityDeposit"
      )
      .populate("vendor", "businessName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your bookings.",
      error: error.message,
    });
  }
};


// ==========================================
// 3. GET DETAILS OF A SINGLE BOOKING
// ==========================================

exports.getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    // Find booking belonging to logged-in customer
    const booking = await Booking.findOne({
      _id: id,
      customer: req.user._id,
    })
      .populate(
        "outfit",
        "title name images rentalPrice securityDeposit rentalDuration"
      )
      .populate("vendor", "businessName");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get booking details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch booking details.",
      error: error.message,
    });
  }
};


// ==========================================
// 4. CANCEL A BOOKING
// ==========================================

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body || {};

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    // Find booking belonging to logged-in customer
    const booking = await Booking.findOne({
      _id: id,
      customer: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Allow cancellation only for pending or confirmed bookings
    if (
      !["pending", "confirmed"].includes(
        booking.bookingStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "This booking can no longer be cancelled.",
      });
    }

    // Prevent cancellation on or after rental start date
    if (
      !booking.rentalStartDate ||
      new Date(booking.rentalStartDate) <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking cannot be cancelled on or after the rental start date.",
      });
    }

    // Update booking status
    booking.bookingStatus = "cancelled";

    // Save cancellation reason if supported by schema
    if (Booking.schema.path("cancellationReason")) {
      booking.cancellationReason =
        cancellationReason || "Cancelled by customer";
    }

    // Save cancellation timestamp if supported by schema
    if (Booking.schema.path("cancelledAt")) {
      booking.cancelledAt = new Date();
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel booking.",
      error: error.message,
    });
  }
};
// ==========================================
// 5. ADD TRACKING ID AND DISPATCH ORDER
// ==========================================

exports.dispatchVendorOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (!trackingId || !trackingId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a tracking ID.",
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      vendor: req.vendor._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found for this vendor.",
      });
    }

    if (
      !["confirmed", "preparing", "dispatched"].includes(
        booking.bookingStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "This order cannot be dispatched in its current status.",
      });
    }

    booking.trackingId = trackingId.trim();
    booking.bookingStatus = "dispatched";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Tracking ID saved and order dispatched.",
      booking,
    });
  } catch (error) {
    console.error("Dispatch vendor order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to dispatch order.",
      error: error.message,
    });
  }
};
// ==========================================
// 5. GET ALL BOOKINGS FOR LOGGED-IN VENDOR
// ==========================================

exports.getVendorBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      vendor: req.vendor._id,
    })
      .populate("customer", "name email phone")
      .populate(
        "outfit",
        "name title images rentalPrice securityDeposit"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get vendor bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch vendor orders.",
    });
  }
};


// ==========================================
// 6. UPDATE VENDOR BOOKING STATUS
// ==========================================

exports.updateVendorBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const allowedStatuses = [
      "confirmed",
      "preparing",
      "dispatched",
      "delivered",
      "return_requested",
      "returned",
      "completed",
    ];

    if (!allowedStatuses.includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status.",
      });
    }

    // Only allow this vendor to update their own bookings
    const booking = await Booking.findOne({
      _id: id,
      vendor: req.vendor._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Do not change cancelled or disputed bookings
    if (
      ["cancelled", "disputed"].includes(
        booking.bookingStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "This booking cannot be updated.",
      });
    }

    booking.bookingStatus = bookingStatus;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully.",
      booking,
    });
  } catch (error) {
    console.error("Update vendor booking status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update booking status.",
    });
  }
};
// ==========================================
// CHECK OUTFIT AVAILABILITY
// ==========================================

exports.checkAvailability = async (req, res) => {
  try {
    const {
      outfitId,
      size,
      rentalStartDate,
      rentalEndDate,
    } = req.query;

    // Validate required fields
    if (
      !outfitId ||
      !size ||
      !rentalStartDate ||
      !rentalEndDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide outfit, size and rental dates.",
      });
    }

    // Validate outfit ID
    if (!mongoose.Types.ObjectId.isValid(outfitId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid outfit ID.",
      });
    }

    // Find approved and available outfit
    const outfit = await Outfit.findOne({
      _id: outfitId,
      status: "approved",
      available: true,
    });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: "Outfit is unavailable.",
      });
    }

    // Check selected size
    const selectedSize = outfit.sizes.find(
      (item) => item.size === size
    );

    if (!selectedSize || selectedSize.quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Selected size is unavailable.",
      });
    }

    const startDate = new Date(rentalStartDate);
    const endDate = new Date(rentalEndDate);

    if (
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid rental dates.",
      });
    }

    // Add FashRentt's 10-day buffer
    const requestedEndWithBuffer = new Date(endDate);

    requestedEndWithBuffer.setDate(
      requestedEndWithBuffer.getDate() + 10
    );

    // Find bookings that may occupy the same size
    const existingBookings = await Booking.find({
      outfit: outfit._id,
      size: size,

      bookingStatus: {
        $in: [
          "confirmed",
          "preparing",
          "dispatched",
          "delivered",
          "return_requested",
        ],
      },

      rentalStartDate: {
        $lt: requestedEndWithBuffer,
      },
    });

    // Check each booking's own 10-day buffer
    const conflictingBookings = existingBookings.filter(
      (booking) => {
        const existingAvailableDate = new Date(
          booking.rentalEndDate
        );

        existingAvailableDate.setDate(
          existingAvailableDate.getDate() + 10
        );

        return existingAvailableDate > startDate;
      }
    );

    const bookedQuantity = conflictingBookings.length;

    const availableQuantity =
      selectedSize.quantity - bookedQuantity;

    if (availableQuantity <= 0) {
      return res.status(200).json({
        success: true,
        available: false,
        availableQuantity: 0,
        message:
          "This outfit size is unavailable for the selected dates.",
      });
    }

    return res.status(200).json({
      success: true,
      available: true,
      availableQuantity,
      message: "Outfit is available for the selected dates.",
    });
  } catch (error) {
    console.error("Check availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check outfit availability.",
      error: error.message,
    });
  }
};