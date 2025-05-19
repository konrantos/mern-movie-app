const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    movieId: { type: Number, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Comment", commentSchema);
