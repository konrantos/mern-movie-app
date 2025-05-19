const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./db");
const authRoutes = require("./routes/auth");
const favoritesRoutes = require("./routes/favorites");
const commentsRoutes = require("./routes/comments");
const usersRoutes = require("./routes/users");

const app = express();

// Middleware CORS
// Επιτρέπει την επικοινωνία με τα front-end dev-servers και τα cookies
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

// Middleware για cookie parsing
app.use(cookieParser());

// Middleware για JSON body parsing
app.use(express.json());

// Debug middleware
// Καταγράφει κάθε αίτημα HTTP στο console
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Σύνδεση με τη βάση MongoDB
connectDB();

// Αρχική διαδρομή για έλεγχο λειτουργίας
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Δηλώνει όλα τα API routes
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/users", usersRoutes);

// Εκκίνηση του server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
