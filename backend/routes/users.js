const express = require("express");
const router  = express.Router();
const User    = require("../models/User");
const Profile = require("../models/Profile");
const Comment = require("../models/Comment"); 

// GET /api/users/:username
// Επιστρέφει το προφίλ του χρήστη με βάση το username
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne(
      { username: req.params.username },
      "username"
    );
    if (!user) {
      return res.status(404).json({ message: "Δεν βρέθηκε χρήστης" });
    }

    let profile = await Profile.findOne({ user: user._id });
    if (!profile) {
      profile = await Profile.create({ user: user._id });
    }

    const {
      level,
      points,
      preferredGenres,
      commentCount,
      genreStats
    } = profile;

    return res.json({
      username: user.username,
      level,
      points,
      preferredGenres,
      commentCount,
      genreStats: Object.fromEntries(profile.genreStats)
    });
  } catch (err) {
    console.error("PROFILE GET error:", err);
    return res.status(500).json({ message: "Σφάλμα ανάκτησης προφίλ" });
  }
});

// POST /api/users/:username/preferences
// Αποθηκεύει τις προτιμήσεις ειδών του χρήστη
router.post("/:username/preferences", async (req, res) => {
  const { preferredGenres } = req.body;
  if (!Array.isArray(preferredGenres)) {
    return res.status(400).json({ message: "Μη έγκυρη λίστα ειδών" });
  }
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: "Δεν βρέθηκε χρήστης" });
    }

    const profile = await Profile.findOneAndUpdate(
      { user: user._id },
      { preferredGenres },
      { new: true, upsert: true }
    );

    return res.json({
      preferredGenres: profile.preferredGenres,
      level: profile.level,
      points: profile.points,
      commentCount: profile.commentCount,
      genreStats: Object.fromEntries(profile.genreStats)
    });
  } catch (err) {
    console.error("PREFERENCES POST error:", err);
    return res.status(500).json({ message: "Σφάλμα αποθήκευσης προτιμήσεων" });
  }
});

// POST /api/users/:username/genre-click
// Ενημερώνει τις στατιστικές click σε είδη
router.post("/:username/genre-click", async (req, res) => {
  const { genreIds } = req.body;
  if (!Array.isArray(genreIds)) {
    return res.status(400).json({ message: "Μη έγκυρα genreIds" });
  }
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: "Δεν βρέθηκε χρήστης" });
    }

    const profile = await Profile.findOneAndUpdate(
      { user: user._id },
      {
        $inc: genreIds.reduce((acc, g) => {
          acc[`genreStats.${g}`] = 1;
          return acc;
        }, {})
      },
      { new: true, upsert: true }
    );

    return res.json({
      genreStats: Object.fromEntries(profile.genreStats)
    });
  } catch (err) {
    console.error("GENRE-CLICK POST error:", err);
    return res.status(500).json({ message: "Σφάλμα ενημέρωσης click stats" });
  }
});

// POST /api/users/:username/genre-favorite
// Ενημερώνει τα αγαπημένα είδη και το επίπεδο
router.post("/:username/genre-favorite", async (req, res) => {
  const { genreIds } = req.body;
  if (!Array.isArray(genreIds)) {
    return res.status(400).json({ message: "Μη έγκυρα genreIds" });
  }
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: "Δεν βρέθηκε χρήστης" });
    }

    let profile = await Profile.findOneAndUpdate(
      { user: user._id },
      {
        $inc: {
          ...genreIds.reduce((acc, g) => {
            acc[`genreStats.${g}`] = 1;
            return acc;
          }, {}),
          points: 1
        }
      },
      { new: true, upsert: true }
    );

    const newLevel = Math.floor(profile.points / 10) + 1;
    if (profile.level !== newLevel) {
      profile.level = newLevel;
      await profile.save();
    }

    return res.json({
      genreStats: Object.fromEntries(profile.genreStats),
      points: profile.points,
      level: profile.level,
      commentCount: profile.commentCount
    });
  } catch (err) {
    console.error("GENRE-FAVORITE POST error:", err);
    return res
      .status(500)
      .json({ message: "Σφάλμα ενημέρωσης favorite stats & points" });
  }
});

module.exports = router;
