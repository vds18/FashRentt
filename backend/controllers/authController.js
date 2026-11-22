
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER CUSTOMER
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      role: "customer",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// LOGIN CUSTOMER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// GET CUSTOMER PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};


 // UPDATE CUSTOMER PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Update customer details
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: name.trim(),
        phone: phone ? phone.trim() : "",
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};


const getCustomerForAddress = async (req) => {
  return await User.findById(req.user.id);
};

// GET SAVED ADDRESSES
exports.getAddresses = async (req, res) => {
  try {
    const user = await getCustomerForAddress(req);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
};

// ADD DELIVERY ADDRESS
exports.addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all address fields",
      });
    }

    const user = await getCustomerForAddress(req);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const makeDefault =
      Boolean(isDefault) || user.addresses.length === 0;

    if (makeDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.addresses.push({
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      isDefault: makeDefault,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Delivery address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add delivery address",
    });
  }
};

// UPDATE DELIVERY ADDRESS
exports.updateAddress = async (req, res) => {
  try {
    const user = await getCustomerForAddress(req);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all address fields",
      });
    }

    address.fullName = fullName.trim();
    address.phone = phone.trim();
    address.addressLine = addressLine.trim();
    address.city = city.trim();
    address.state = state.trim();
    address.pincode = pincode.trim();

    if (isDefault) {
  user.addresses.forEach((item) => {
    item.isDefault = false;
  });

  address.isDefault = true;
} else {
  address.isDefault = false;
}

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};

// DELETE DELIVERY ADDRESS
exports.deleteAddress = async (req, res) => {
  try {
    const user = await getCustomerForAddress(req);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wasDefault = address.isDefault;

    address.deleteOne();

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};