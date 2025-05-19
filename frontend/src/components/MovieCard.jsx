// Εμφανίζει μία κάρτα ταινίας με εικόνα, τίτλο, είδος και κουμπί αγαπημένων

import "../css/MovieCard.css";
import { useMovieContext } from "../contexts/MovieContext";
import { useGenreContext } from "../contexts/GenreContext";
import { Link, useNavigate } from "react-router-dom";

function MovieCard({ movie }) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
  const { genres } = useGenreContext();
  const favorite = isFavorite(movie.id);
  const navigate = useNavigate();

  // Εναλλαγή ταινίας στα αγαπημένα
  function onFavoriteClick(e) {
    e.preventDefault();
    if (favorite) {
      removeFromFavorites(movie.id);
    } else {
      const simplifiedMovie = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || "",
        release_date: movie.release_date || "",
        genre_ids: movie.genre_ids || [],
      };
      addToFavorites(simplifiedMovie);
    }
  }

  // Λίστα ειδών της ταινίας (αντιστοιχία με genre context)
  const genreList = movie.genre_ids
    ?.map((id) => genres.find((g) => g.id === id))
    .filter(Boolean);

  return (
    <div className="movie-card">
      {/* Πηγαίνει στη σελίδα της ταινίας */}
      <Link to={`/movie/${movie.id}`}>
        <div className="movie-poster">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
          />
          <div className="rating-badge">
            ⭐ {movie.vote_average?.toFixed(1)}
          </div>
          <div className="movie-overlay">
            {/* Κουμπί αγαπημένων */}
            <button
              className={`favorite-btn ${favorite ? "active" : ""}`}
              onClick={onFavoriteClick}
            >
              ♥
            </button>
          </div>
        </div>
      </Link>

      {/* Πληροφορίες ταινίας */}
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p className="release-year">{movie.release_date?.split("-")[0]}</p>

        {/* Κουμπιά ειδών με σύνδεση σε σελίδα genre */}
        <div className="genre-links">
          {genreList.map((genre) => (
            <button
              key={genre.id}
              className="genre-link"
              onClick={() => navigate(`/genre/${genre.id}`)}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
