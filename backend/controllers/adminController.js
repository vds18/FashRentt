
const Vendor = require("../models/Vendor");
const Outfit = require("../models/Outfit");

// Get all vendor applications
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: vendors.length,
      vendors,
    });
  } catch (error) {
    console.error("Get vendors error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch vendors",
      error: error.message,
    });
  }
};

// Approve or reject vendor application
exports.updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    // Find vendor by MongoDB ID
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor application not found",
      });
    }

    // Update vendor status
    vendor.status = status;

    await vendor.save();

    return res.status(200).json({
      success: true,
      message: `Vendor ${status} successfully`,
      vendor,
    });
  } catch (error) {
    console.error("Vendor approval error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update vendor status",
      error: error.message,
    });
  }
};

// Get all outfits for admin
exports.getAllOutfits = async (req, res) => {
  try {
    const outfits = await Outfit.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: outfits.length,
      outfits,
    });
  } catch (error) {
    console.error("Get all outfits error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve or reject an outfit
exports.updateOutfitStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    const outfit = await Outfit.findById(req.params.id);

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: "Outfit not found",
      });
    }

    outfit.status = status;
    await outfit.save();

    res.status(200).json({
      success: true,
      message: `Outfit ${status} successfully`,
      outfit,
    });
  } catch (error) {
    console.error("Update outfit status error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};