const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");

const protectVendor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please log in as a vendor.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Ensure this is a vendor token
    if (
      decoded.accountType !== "vendor" ||
      !decoded.vendorId
    ) {
      return res.status(403).json({
        success: false,
        message: "Vendor access only.",
      });
    }

    const vendor = await Vendor.findById(
      decoded.vendorId
    ).select("-password");

    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: "Vendor account not found.",
      });
    }

    // Check approval status on every request
    if (vendor.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your vendor account is not approved.",
      });
    }

    req.vendor = vendor;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired vendor token.",
    });
  }
};

module.exports = { protectVendor };