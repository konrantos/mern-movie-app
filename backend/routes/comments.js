const express = require("express");
const router  = express.Router();
const Comment = require("../models/Comment");
const User    = require("../models/User");
const Profile = require("../models/Profile");

// GET /api/comments/count/:username
// Επιστρέφει πόσα σχόλια έχει ο χρήστης
router.get("/count/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ count: 0 });
    }
    const agg = await Comment.aggregate([
      { $match: { userId: user._id } },
      { $count: "count" }
    ]);
    return res.json({ count: agg[0]?.count || 0 });
  } catch (err) {
    console.error("COMMENTS COUNT error:", err);
    return res.status(500).json({ count: 0 });
  }
});

// GET /api/comments/leaderboard
// Επιστρέφει top 10 χρήστες με τα περισσότερα σχόλια
router.get("/leaderboard", async (_req, res) => {
  try {
    const stats = await Comment.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          username: "$user.username",
          count: 1
        }
      }
    ]);
    return res.json(stats);
  } catch (err) {
    console.error("LEADERBOARD error:", err);
    return res.status(500).json({ message: "Σφάλμα leaderboard" });
  }
});

// GET /api/comments/points-leaderboard
// Επιστρέφει χρήστες με βάση τους πόντους τους
router.get("/points-leaderboard", async (_req, res) => {
  try {
    const profiles = await Profile.find()
      .populate("user", "username")
      .sort({ points: -1 });

    const result = profiles.map((p) => ({
      username: p.user?.username || "Χωρίς όνομα",
      points: p.points
    }));

    res.json(result);
  } catch (err) {
    console.error("POINTS LEADERBOARD error:", err);
    res.status(500).json({ message: "Σφάλμα leaderboard πόντων" });
  }
});

// GET /api/comments/:movieId
// Επιστρέφει όλα τα σχόλια για συγκεκριμένη ταινία
router.get("/:movieId", async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId, 10);
    if (isNaN(movieId)) throw new Error("Invalid movieId");
    const rows = await Comment.find({ movieId })
      .sort({ createdAt: -1 })
      .populate("userId", "username");
    return res.json(rows);
  } catch (err) {
    console.error("COMMENTS GET error:", err);
    return res.status(500).json({ message: "Σφάλμα ανάκτησης σχολίων" });
  }
});

// POST /api/comments/:movieId
// Αποθηκεύει νέο σχόλιο και ενημερώνει προφίλ
router.post("/:movieId", async (req, res) => {
  const { username, text } = req.body;
  if (!username) {
    return res
      .status(401)
      .json({ message: "Πρέπει να είσαι συνδεδεμένος για να σχολιάσεις." });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(403).json({ message: "Μη εξουσιοδοτημένος." });
  }

  const trimmed = (text || "").trim();
  if (!trimmed) {
    return res.status(400).json({ message: "Κενό σχόλιο" });
  }

  try {
    const newComment = await Comment.create({
      movieId: parseInt(req.params.movieId, 10),
      userId: user._id,
      text: trimmed,
    });
    await newComment.populate("userId", "username");

    let profile = await Profile.findOneAndUpdate(
      { user: user._id },
      {
        $inc: { commentCount: 1, points: 2 }
      },
      { new: true, upsert: true }
    );

    const newLevel = Math.floor(profile.points / 10) + 1;
    if (profile.level !== newLevel) {
      profile.level = newLevel;
      await profile.save();
    }

    return res.status(201).json({
      comment: newComment,
      profile: {
        commentCount: profile.commentCount,
        points: profile.points,
        level: profile.level
      }
    });
  } catch (err) {
    console.error("COMMENTS POST error:", err);
    return res.status(500).json({ message: "Σφάλμα αποθήκευσης" });
  }
});

module.exports = router;
