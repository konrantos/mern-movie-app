// Εμφανίζει την πάνω μπάρα πλοήγησης με σύνδεσμους, login/logout και mobile μενού

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import "../css/Navbar.css";

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { username, setUsername } = useMovieContext();
  const isLoggedIn = !!username;

  // Αποσυνδέει τον χρήστη και καθαρίζει το localStorage
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    localStorage.removeItem("username");
    setUsername("");
    setMenuOpen(false);
    navigate("/");
  };

  // Κάνει scroll στο section 'Προβάλλονται Τώρα'
  const handleScrollToNowPlaying = () => {
    navigate("/#now-playing");
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* Τίτλος εφαρμογής */}
      <div className="navbar-brand">
        <Link to="/" onClick={() => setMenuOpen(false)}>
          2565 Movie App
        </Link>
      </div>

      {/* Σύνδεσμοι πλοήγησης */}
      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
          Αρχική
        </Link>

        <button
          onClick={handleScrollToNowPlaying}
          className="nav-link"
          style={{ background: "none", border: "none", padding: 0 }}
        >
          Προβάλλονται Τώρα
        </button>

        <Link
          to="/favorites"
          className="nav-link"
          onClick={() => setMenuOpen(false)}
        >
          Αγαπημένα
        </Link>

        <Link
          to="/leaderboard"
          className="nav-link"
          onClick={() => setMenuOpen(false)}
        >
          Leaderboard
        </Link>

        {/* Αν είναι συνδεδεμένος */}
        {isLoggedIn ? (
          <>
            <Link
              to="#"
              className="nav-link logout-link"
              onClick={handleLogout}
            >
              Αποσύνδεση
            </Link>
            <Link
              to="/profile"
              className="nav-link profile-link"
              onClick={() => setMenuOpen(false)}
            >
              <img
                src="/red-profile.jpg"
                alt="Profile"
                className="profile-img"
              />
            </Link>
          </>
        ) : (
          // Αν δεν είναι συνδεδεμένος
          <Link
            to="/login"
            className="nav-link button-style"
            onClick={() => setMenuOpen(false)}
          >
            Σύνδεση
          </Link>
        )}
      </div>

      {/* Κουμπί menu toggle για κινητά */}
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>
    </nav>
  );
}

export default NavBar;
