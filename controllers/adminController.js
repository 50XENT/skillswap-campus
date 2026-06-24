const User = require("../models/User");
const Skill = require("../models/Skill");
const Request = require("../models/Request");

exports.getAdminOverview = async (req, res) => {
  try {
    const totals = {
      users: await User.countDocuments(),
      skills: await Skill.countDocuments(),
      requests: await Request.countDocuments(),
    };

    const users = await User.find().select("name email role").sort({ createdAt: -1 }).limit(10);
    const requests = await Request.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("skill", "title owner")
      .populate("requester", "name email");

    await Promise.all(
      requests.map(async (reqItem) => {
        await reqItem.populate({ path: "skill", select: "title owner" }).execPopulate();
        await reqItem.skill.populate({ path: "owner", select: "name email" }).execPopulate();
      })
    );

    res.json({ totals, users, requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
