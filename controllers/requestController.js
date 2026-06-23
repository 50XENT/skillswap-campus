const Request = require("../models/Request");
const Skill = require("../models/Skill");

exports.createRequest = async (req, res) => {
  try {
    const { skillId, message } = req.body;

    if (!skillId) {
      return res.status(400).json({ message: "skillId is required" });
    }

    const skill = await Skill.findById(skillId);

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    if (skill.owner.equals(req.user._id)) {
      return res.status(400).json({ message: "Cannot request your own skill" });
    }

    const existingRequest = await Request.findOne({
      requester: req.user._id,
      skill: skillId,
    });

    if (existingRequest) {
      return res.status(400).json({ message: "You have already requested this skill" });
    }

    const request = await Request.create({
      requester: req.user._id,
      skill: skillId,
      message,
    });

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user._id })
      .populate("skill", "title description")
      .populate("requester", "name email");

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getReceivedRequests = async (req, res) => {
  try {
    const skills = await Skill.find({ owner: req.user._id }).select("_id");
    const skillIds = skills.map((skill) => skill._id);

    const requests = await Request.find({ skill: { $in: skillIds } })
      .populate("skill", "title")
      .populate("requester", "name email");

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id).populate("skill");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (!request.skill.owner.equals(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    request.status = status;
    await request.save();

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
