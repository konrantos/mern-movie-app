const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Προστατεύει routes ελέγχοντας το cookie 'token'
module.exports = async (req, res, next) => {
  try {
    // Παίρνει το token από τα cookies
    const token = req.cookies.token;

    // Αν δεν υπάρχει, μπλοκάρει την πρόσβαση
    if (!token) return res.status(401).json({ message: "Μη εξουσιοδοτημένος" });

    // Επαληθεύει το JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    // Βρίσκει τον χρήστη και το βάζει στο request
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch {
    return res.status(401).json({ message: "Άκυρο ή ληγμένο token" });
  }
};
