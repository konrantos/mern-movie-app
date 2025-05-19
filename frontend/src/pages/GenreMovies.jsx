// Σελίδα που εμφανίζει ταινίες για ένα συγκεκριμένο είδος (genre)

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMoviesByGenre, getGenres } from "../services/api";
import MovieCard from "../components/MovieCard";
import "../css/GenreMovies.css";

function GenreMovies() {
  const { genreId } = useParams();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [genreName, setGenreName] = useState("");
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Φόρτωση ταινιών και ονομάτων ειδών με βάση το genreId
  useEffect(() => {
    const fetchGenreMovies = async () => {
      try {
        const genreMovies = await getMoviesByGenre(genreId);
        setMovies(genreMovies);

        const allGenres = await getGenres();
        setGenres(allGenres);

        const selected = allGenres.find((g) => g.id.toString() === genreId);
        if (selected) setGenreName(selected.name);
      } catch (err) {
        setError("Σφάλμα κατά τη φόρτωση...");
      } finally {
        setLoading(false);
      }
    };

    fetchGenreMovies();
  }, [genreId]);

  // Αλλαγή είδους μέσω dropdown
  const handleGenreChange = (e) => {
    const selectedId = e.target.value;
    if (selectedId !== "") {
      navigate(`/genre/${selectedId}`);
    }
  };

  return (
    <div className="genre-page">
      {/* Επιλογή άλλου είδους */}
      <div className="genre-filter">
        <h2>Διάλεξε άλλο είδος:</h2>
        <select
          className="genre-select"
          onChange={handleGenreChange}
          defaultValue=""
        >
          <option value="">Επιλογή είδους</option>
          {genres.map((genre) => (
            <option value={genre.id} key={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      {/* Τίτλος είδους */}
      {genreName && (
        <h2 className="section-title">Δημοφιλείς {genreName} ταινίες</h2>
      )}

      {/* Περιεχόμενο σελίδας */}
      {loading ? (
        <div className="loading">Φόρτωση...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : movies.length === 0 ? (
        <p className="no-results">Δεν βρέθηκαν ταινίες.</p>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard movie={movie} key={movie.id} />
          ))}
        </div>
      )}
    </div>
  );
}

export default GenreMovies;
