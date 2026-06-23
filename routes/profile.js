const express = require("express");
const auth = require("../middleware/authMiddleware");
const {
  getCurrentUser,
  updateCurrentUser,
} = require("../controllers/authController");

const router = express.Router();

router.get("/me", auth, getCurrentUser);
router.put("/me", auth, updateCurrentUser);

module.exports = router;
