
const Outfit = require("../models/Outfit");

// Get all approved outfits
exports.getApprovedOutfits = async (req, res) => {
  try {
    const outfits = await Outfit.find({
      status: "approved",
      available: true,
    })
      .select(
        "name description category occasion images sizes rentalPrice securityDeposit rentalDuration averageRating totalReviews isFeatured"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: outfits.length,
      outfits,
    });
  } catch (error) {
    console.error("Get approved outfits error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch outfits",
    });
  }
};

// Get single approved outfit
exports.getOutfitById = async (req, res) => {
  try {
    const outfit = await Outfit.findOne({
      _id: req.params.id,
      status: "approved",
      available: true,
    }).select("-vendor");

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: "Outfit not found or unavailable",
      });
    }

    res.status(200).json({
      success: true,
      outfit,
    });
  } catch (error) {
    console.error("Get outfit error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch outfit",
    });
  }
};

// Create outfit by approved vendor
exports.createVendorOutfit = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      occasion,
      images,
      sizes,
      rentalPrice,
      securityDeposit,
      rentalDuration,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !category ||
      rentalPrice === undefined ||
      securityDeposit === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required outfit details",
      });
    }

    // Create outfit linked to the logged-in vendor
    const outfit = await Outfit.create({
      vendor: req.vendor._id,
      name,
      description,
      category,
      occasion: occasion || [],
      images: images || [],
      sizes: sizes || [],
      rentalPrice,
      securityDeposit,
      rentalDuration: rentalDuration || 3,

      // Admin must approve before customers can see it
      status: "pending",
      available: true,
    });

    res.status(201).json({
      success: true,
      message: "Outfit submitted for admin approval",
      outfit,
    });
  } catch (error) {
    console.error("Create vendor outfit error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create outfit",
    });
  }
};
// Get all outfits uploaded by the logged-in vendor
exports.getVendorOutfits = async (req, res) => {
  try {
    const outfits = await Outfit.find({
      vendor: req.vendor._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: outfits.length,
      outfits,
    });
  } catch (error) {
    console.error("Get vendor outfits error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch vendor inventory",
    });
  }
};

// Update an outfit owned by the logged-in vendor
exports.updateVendorOutfit = async (req, res) => {
  try {
    const outfit = await Outfit.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: "Outfit not found",
      });
    }

    const {
      name,
      description,
      category,
      occasion,
      color,
      images,
      sizes,
      rentalPrice,
      securityDeposit,
      rentalDuration,
    } = req.body;

    if (name !== undefined) outfit.name = name;
    if (description !== undefined)
      outfit.description = description;
    if (category !== undefined) outfit.category = category;
    if (occasion !== undefined) outfit.occasion = occasion;
    if (color !== undefined) outfit.color = color;
    if (images !== undefined) outfit.images = images;
    if (sizes !== undefined) outfit.sizes = sizes;

    if (rentalPrice !== undefined)
      outfit.rentalPrice = rentalPrice;

    if (securityDeposit !== undefined)
      outfit.securityDeposit = securityDeposit;

    if (rentalDuration !== undefined)
      outfit.rentalDuration = rentalDuration;

    await outfit.save();

    res.status(200).json({
      success: true,
      message: "Outfit updated successfully",
      outfit,
    });
  } catch (error) {
    console.error("Update vendor outfit error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update outfit",
    });
  }
};
// Toggle outfit availability
exports.toggleVendorOutfitAvailability = async (req, res) => {
  try {
    const outfit = await Outfit.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: "Outfit not found",
      });
    }

    outfit.available = !outfit.available;

    await outfit.save();

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      outfit,
    });
  } catch (error) {
    console.error("Toggle availability error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update availability",
    });
  }
};


// Delete an outfit owned by the logged-in vendor
exports.deleteVendorOutfit = async (req, res) => {
  try {
    const outfit = await Outfit.findOne({
      _id: req.params.id,
      vendor: req.vendor._id,
    });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: "Outfit not found",
      });
    }

    await Outfit.deleteOne({
      _id: outfit._id,
      vendor: req.vendor._id,
    });

    res.status(200).json({
      success: true,
      message: "Outfit deleted successfully",
    });
  } catch (error) {
    console.error("Delete vendor outfit error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete outfit",
    });
  }
};