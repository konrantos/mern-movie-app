const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  movieIds: {
    type: [Number],
    default: [],
  },
});

module.exports = mongoose.model("Favorite", FavoriteSchema);
