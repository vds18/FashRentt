
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    outfit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outfit",
      required: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    size: {
      type: String,
      required: true,
    },
    color: {
  type: String,
  required: true,
},
    rentalStartDate: {
      type: Date,
      required: true,
    },

    rentalEndDate: {
      type: Date,
      required: true,
    },

    rentalPrice: {
      type: Number,
      required: true,
    },

    securityDeposit: {
      type: Number,
      required: true,
    },

    deliveryFee: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      default: "pending",
    },

    paymentId: {
      type: String,
      default: null,
    },

    bookingStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "dispatched",
        "delivered",
        "return_requested",
        "returned",
        "completed",
        "cancelled",
        "disputed",
      ],
      default: "pending",
    },

    deliveryAddress: {
      fullName: String,
      phone: String,
      addressLine: String,
      city: String,
      state: String,
      pincode: String,
    },

    trackingId: {
      type: String,
      default: null,
    },

    depositRefundStatus: {
      type: String,
      enum: ["not_applicable", "pending", "processed", "withheld"],
      default: "pending",
    },

    returnCondition: {
      type: String,
      enum: ["not_checked", "good", "damaged", "missing"],
      default: "not_checked",
    },

    cancellationReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);