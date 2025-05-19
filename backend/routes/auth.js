const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Favorite = require("../models/Favorite");
const protect = require("../middleware/protect");

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password) => {
  const lengthValid = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return lengthValid && hasLower && hasUpper && hasNumber && hasSymbol;
};

// POST /api/auth/register
// Δημιουργεί νέο χρήστη και αποθηκεύει token
router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  try {
    if (!validateEmail(email))
      return res.status(400).json({ message: "Μη έγκυρη διεύθυνση email" });
    if (username.length < 4)
      return res
        .status(400)
        .json({ message: "Το username πρέπει να έχει τουλάχιστον 4 χαρακτήρες" });
    if (!validatePassword(password))
      return res.status(400).json({
        message:
          "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες, ένα πεζό, ένα κεφαλαίο, ένα νούμερο και ένα σύμβολο",
      });

    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email: new RegExp(`^${email}$`, "i") }),
      User.findOne({ username: new RegExp(`^${username}$`, "i") }),
    ]);
    if (existingEmail)
      return res.status(400).json({ message: "Το email χρησιμοποιείται ήδη" });
    if (existingUsername)
      return res.status(400).json({ message: "Το username χρησιμοποιείται ήδη" });

    const newUser = await new User({ email, username, password }).save();
    await new Favorite({ user: newUser._id, movieIds: [] }).save();

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ message: "Εγγραφή επιτυχής", user: newUser });
  } catch (err) {
    console.error("REGISTER error:", err);
    res.status(500).json({ message: "Σφάλμα κατά την εγγραφή" });
  }
});

// POST /api/auth/login
// Συνδέει τον χρήστη και αποθηκεύει token
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: "Ο χρήστης δεν βρέθηκε" });

    const valid = await user.verifyPassword(password);
    if (!valid)
      return res.status(401).json({ message: "Λανθασμένος κωδικός" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ message: "Επιτυχής σύνδεση", user });
  } catch (err) {
    console.error("LOGIN error:", err);
    res.status(500).json({ message: "Σφάλμα κατά τη σύνδεση" });
  }
});

// POST /api/auth/logout
// Κάνει αποσύνδεση του χρήστη (σβήνει το cookie)
router.post("/logout", (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
  res.json({ message: "Αποσυνδεθήκατε επιτυχώς" });
});

// GET /api/auth/me
// Επιστρέφει τον τρέχοντα χρήστη από το token
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
