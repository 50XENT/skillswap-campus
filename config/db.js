const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/skillswap-campus";

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.warn("MongoDB connection error:", error.message);
    console.warn("Running in demo mode without database persistence");
  }
};

module.exports = connectDB;
