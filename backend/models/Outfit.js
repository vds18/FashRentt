
const mongoose = require("mongoose");

const outfitSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Women",
        "Men",
        "Ethnic Wear",
        "Western Wear",
        "Party Wear",
        "Accessories",
      ],
      required: true,
    },

    occasion: [String],

    color: {
      type: [String],
      default: [],
    },

    images: [String],

    sizes: [
      {
        size: String,
        quantity: {
          type: Number,
          default: 1,
          min: 0,
        },
      },
    ],

    rentalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    securityDeposit: {
      type: Number,
      required: true,
      min: 0,
    },

    rentalDuration: {
      type: Number,
      default: 3,
    },

    available: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Outfit", outfitSchema);