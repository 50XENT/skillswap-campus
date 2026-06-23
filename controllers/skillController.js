const Skill = require("../models/Skill");

exports.createSkill = async (req, res) => {
  try {
    const { title, description, tags, location } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const skill = await Skill.create({
      title,
      description,
      tags: tags || [],
      location,
      owner: req.user._id,
    });

    res.status(201).json(skill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ active: true }).populate("owner", "name email");
    res.json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMySkills = async (req, res) => {
  try {
    const skills = await Skill.find({ owner: req.user._id, active: true }).populate("owner", "name email");
    res.json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).populate("owner", "name email");

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    res.json(skill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    if (!skill.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { title, description, tags, location, active } = req.body;

    if (title) skill.title = title;
    if (description) skill.description = description;
    if (tags) skill.tags = tags;
    if (location) skill.location = location;
    if (typeof active === "boolean") skill.active = active;

    await skill.save();
    res.json(skill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    if (!skill.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await skill.remove();
    res.json({ message: "Skill removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
