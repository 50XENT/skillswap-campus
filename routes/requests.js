const express = require("express");
const {
  createRequest,
  getUserRequests,
  getReceivedRequests,
  updateRequestStatus,
} = require("../controllers/requestController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", auth, createRequest);
router.get("/mine", auth, getUserRequests);
router.get("/received", auth, getReceivedRequests);
router.put("/:id", auth, updateRequestStatus);

module.exports = router;
