
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

router.get("/profile", protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
    },
  });
});

module.exports = router;