// Εμφανίζει το footer της εφαρμογής με βασικά links πλοήγησης

import React from "react";
import { Link } from "react-router-dom";
import "../css/Footer.css";

function Footer() {
  return (
    <div className="footer">
      <div className="footer__content container">
        <h2 className="footer-title">2565 Movie App</h2>

        {/* Μενού πλοήγησης στο footer */}
        <div className="footer__content__menus">
          <div className="footer__content__menu">
            <Link to="/">Αρχική</Link>
            <Link to="/favorites">Αγαπημένα</Link>
            <Link to="/leaderboard">Leaderboards</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
