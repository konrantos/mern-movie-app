// Εμφανίζει το search bar με πεδίο αναζήτησης και φίλτρα (είδος, βαθμολογία, έτος)

import React, { useState, useEffect } from "react";
import "../css/SearchBar.css";
import { getGenres } from "../services/api";

function SearchBar({
  searchQuery,
  onQueryChange,
  onQuerySubmit,
  selectedGenre,
  onGenreChange,
  minRating,
  onRatingChange,
  yearMin,
  onYearMinChange,
  yearMax,
  onYearMaxChange,
  onClear,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [genres, setGenres] = useState([]);

  // Φόρτωση ειδών από το API
  useEffect(() => {
    getGenres()
      .then(setGenres)
      .catch(() => setGenres([]));
  }, []);

  return (
    <form onSubmit={onQuerySubmit} className="search-form">
      {/* Πεδίο αναζήτησης */}
      <input
        type="text"
        className="search-input"
        placeholder="Αναζήτηση ταινιών..."
        value={searchQuery}
        onChange={onQueryChange}
      />

      <button type="submit" className="search-button">
        Αναζήτηση
      </button>

      {/* Κουμπί εμφάνισης φίλτρων */}
      <button
        type="button"
        className="filter-button"
        onClick={() => setShowFilters((f) => !f)}
      >
        Φίλτρα
      </button>

      {/* Φίλτρα αναζήτησης */}
      {showFilters && (
        <div className="filters-container">
          {/* Επιλογή είδους */}
          <select
            className="filter-select"
            value={selectedGenre}
            onChange={(e) => onGenreChange(e.target.value)}
          >
            <option value="">Είδος</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Επιλογή ελάχιστης βαθμολογίας */}
          <select
            className="filter-select"
            value={minRating}
            onChange={(e) => onRatingChange(e.target.value)}
          >
            <option value="">Ελάχιστη Βαθμολογία</option>
            {[4, 5, 6, 7, 8].map((r) => (
              <option key={r} value={r}>
                {r}+
              </option>
            ))}
          </select>

          {/* Επιλογή εύρους ετών */}
          <div className="year-range-container">
            <label>
              Έτος: {yearMin} – {yearMax}
            </label>
            <div className="year-range-bar">
              <input
                type="range"
                min="1950"
                max="2025"
                value={yearMin}
                onChange={(e) =>
                  onYearMinChange(Math.min(+e.target.value, yearMax))
                }
                className="year-range-slider"
              />
              <input
                type="range"
                min="1950"
                max="2025"
                value={yearMax}
                onChange={(e) =>
                  onYearMaxChange(Math.max(+e.target.value, yearMin))
                }
                className="year-range-slider"
              />
            </div>
          </div>

          {/* Κουμπί καθαρισμού φίλτρων */}
          <button
            type="button"
            className="filter-button"
            style={{ marginTop: "0.5rem" }}
            onClick={onClear}
          >
            Καθαρισμός
          </button>
        </div>
      )}
    </form>
  );
}

export default SearchBar;
