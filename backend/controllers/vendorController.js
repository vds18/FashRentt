const Vendor = require("../models/Vendor");
const bcrypt = require("bcryptjs");

// Register Vendor
const registerVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      shopName,
      shopAddress,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !shopName ||
      !shopAddress
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingVendor = await Vendor.findOne({
      email: normalizedEmail,
    });

    if (existingVendor) {
      return res.status(409).json({
        success: false,
        message: "Vendor email already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const vendor = await Vendor.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      shopName: shopName.trim(),
      shopAddress: shopAddress.trim(),
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Vendor registered successfully. Await admin approval.",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        shopName: vendor.shopName,
        status: vendor.status,
      },
    });
  } catch (error) {
    console.error("Vendor registration error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error during vendor registration.",
    });
  }
};

// Vendor Login
const jwt = require("jsonwebtoken");

const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const vendor = await Vendor.findOne({
      email: normalizedEmail,
    });

    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      vendor.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (vendor.status !== "approved") {
      return res.status(403).json({
        success: false,
        message:
          vendor.status === "pending"
            ? "Your account is awaiting admin approval."
            : "Your vendor account has been rejected.",
      });
    }

    const token = jwt.sign(
      {
        vendorId: vendor._id,
        accountType: "vendor",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Vendor login successful.",
      token,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        shopName: vendor.shopName,
        status: vendor.status,
      },
    });
  } catch (error) {
    console.error("Vendor login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during vendor login.",
    });
  }
};

// Get Vendor Profile
const getVendorProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      vendor: req.vendor,
    });
  } catch (error) {
    console.error("Vendor profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch vendor profile.",
    });
  }
};

module.exports = {
  registerVendor,
  loginVendor,
  getVendorProfile,
};