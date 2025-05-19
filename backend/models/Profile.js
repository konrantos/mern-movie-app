const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  level: {
    type: Number,
    default: 1
  },
  points: {
    type: Number,
    default: 0
  },
  preferredGenres: {
    type: [Number],
    default: []
  },
  commentCount: {
    type: Number,
    default: 0
  },
  genreStats: {
    type: Map,
    of: Number,
    default: {}
  }
});

module.exports = mongoose.model("Profile", ProfileSchema);
