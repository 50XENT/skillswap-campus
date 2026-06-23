const express = require("express");
const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getCurrentUser,
  updateCurrentUser,
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.get("/me", auth, getCurrentUser);
router.put("/me", auth, updateCurrentUser);
router.get("/admin-test", auth, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Admin access verified" });
});

module.exports = router;
