const express = require("express");
const router = express.Router();
const Favorite = require("../models/Favorite");
const User = require("../models/User");

// GET /api/favorites/:username
// Επιστρέφει τα αγαπημένα του χρήστη
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "Δεν βρέθηκε χρήστης" });

    const fav = await Favorite.findOne({ user: user._id });
    if (!fav) return res.status(404).json({ message: "Δεν βρέθηκαν αγαπημένα" });

    return res.json(fav.movieIds);
  } catch (err) {
    console.error("FAVORITES GET error:", err);
    return res.status(500).json({ message: "Σφάλμα κατά την ανάκτηση" });
  }
});

// POST /api/favorites/:username
// Προσθέτει μια ταινία στα αγαπημένα και αυξάνει το level
router.post("/:username", async (req, res) => {
  const movieId = parseInt(req.body.movieId, 10);
  if (isNaN(movieId)) {
    return res.status(400).json({ message: "Μη έγκυρο movieId" });
  }

  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "Δεν βρέθηκε χρήστης" });

    let fav = await Favorite.findOne({ user: user._id });
    if (!fav) {
      fav = new Favorite({ user: user._id, movieIds: [movieId] });
    } else if (!fav.movieIds.includes(movieId)) {
      fav.movieIds.push(movieId);
    } else {
      return res.status(200).json({ message: "Ήδη στα αγαπημένα" });
    }

    await fav.save();

    user.points = (user.points || 0) + 1;
    const newLevel = Math.floor(user.points / 10) + 1;
    if (newLevel !== user.level) user.level = newLevel;
    await user.save();

    return res.json({ message: "Προστέθηκε στα αγαπημένα" });
  } catch (err) {
    console.error("FAVORITES POST error:", err);
    return res.status(500).json({ message: "Σφάλμα προσθήκης" });
  }
});

// DELETE /api/favorites/:username/:movieId
// Αφαιρεί μια ταινία από τα αγαπημένα
router.delete("/:username/:movieId", async (req, res) => {
  const movieId = parseInt(req.params.movieId, 10);
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "Δεν βρέθηκε χρήστης" });

    const fav = await Favorite.findOne({ user: user._id });
    if (!fav) return res.status(404).json({ message: "Δεν βρέθηκαν αγαπημένα" });

    fav.movieIds = fav.movieIds.filter((id) => id !== movieId);
    await fav.save();
    return res.json({ message: "Αφαιρέθηκε από τα αγαπημένα" });
  } catch (err) {
    console.error("FAVORITES DELETE error:", err);
    return res.status(500).json({ message: "Σφάλμα αφαίρεσης" });
  }
});

module.exports = router;
