
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    addresses: [
      {
        fullName: String,
        phone: String,
        addressLine: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Outfit",
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);