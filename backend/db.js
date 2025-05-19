const mongoose = require("mongoose");

// Συνδέεται με τη βάση MongoDB τοπικά
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/movieApp");
    console.log("MongoDB connected ✅");
  } catch (error) {
    console.error("MongoDB connection error ❌:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
