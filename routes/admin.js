const express = require("express");
const auth = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getAdminOverview } = require("../controllers/adminController");

const router = express.Router();

router.get("/overview", auth, authorizeRoles("admin"), getAdminOverview);

module.exports = router;
