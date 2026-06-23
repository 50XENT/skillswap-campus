const express = require("express");
const {
  createSkill,
  getAllSkills,
  getMySkills,
  getSkillById,
  updateSkill,
  deleteSkill,
} = require("../controllers/skillController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllSkills);
router.get("/mine", auth, getMySkills);
router.post("/", auth, createSkill);
router.get("/:id", getSkillById);
router.put("/:id", auth, updateSkill);
router.delete("/:id", auth, deleteSkill);

module.exports = router;
