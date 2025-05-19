// Σελίδα λεπτομερειών για κάθε ταινία

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/MovieDetails.css";
import {
  getMovieDetails,
  getMovieTrailer,
  getMovieCredits,
  getSimilarMovies,
} from "../services/api";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import CommentsSection from "../components/CommentsSection";

function MovieDetails() {
  const { id } = useParams(); // παίρνει το movieId από το URL
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [cast, setCast] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();

  // Φόρτωση όλων των δεδομένων ταινίας
  useEffect(() => {
    const fetchData = async () => {
      try {
        const details = await getMovieDetails(id);
        setMovie(details);

        const trailer = await getMovieTrailer(id);
        if (trailer) setTrailerKey(trailer.key);

        const credits = await getMovieCredits(id);
        setCast(credits.slice(0, 5));

        const similar = await getSimilarMovies(id);
        setSimilarMovies(similar.slice(0, 6));
      } catch (error) {
        console.error("Σφάλμα κατά την ανάκτηση ταινίας:", error);
      }
    };

    fetchData();
  }, [id]);

  if (!movie) return <div>Φόρτωση...</div>;

  const favorite = isFavorite(movie.id);

  return (
    <div className="movie-details">
      {/* Κεντρική εικόνα + βασικά στοιχεία */}
      <div
        className="movie-hero"
        style={{
          backgroundImage: movie.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
            : "none",
        }}
      >
        <div className="movie-hero-overlay">
          <div className="movie-info-top">
            <img
              className="poster"
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
            />
            <div className="text">
              <div className="rating-top-right">
                ⭐ {movie.vote_average.toFixed(1)}
              </div>
              <h1>{movie.title}</h1>
              <p>
                {movie.overview
                  ? movie.overview
                  : "Δεν υπάρχει διαθέσιμη περιγραφή για αυτή την ταινία."}
              </p>
              <p>
                <strong>Ημερομηνία κυκλοφορίας:</strong> {movie.release_date}
              </p>

              {/* Εμφάνιση ειδών */}
              {movie.genres && (
                <div className="genre-links">
                  {movie.genres.map((genre) => (
                    <Link
                      to={`/genre/${genre.id}`}
                      key={genre.id}
                      className="genre-link"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Κουμπί αγαπημένων */}
              <button
                className={`favorite-btn-detail ${favorite ? "active" : ""}`}
                onClick={() => {
                  if (favorite) {
                    removeFromFavorites(movie.id);
                  } else {
                    const simplifiedMovie = {
                      id: movie.id,
                      title: movie.title,
                      poster_path: movie.poster_path || "",
                      release_date: movie.release_date || "",
                      genre_ids: movie.genres?.map((g) => g.id) || [],
                    };
                    addToFavorites(simplifiedMovie);
                  }
                }}
              >
                {favorite ? "Αφαίρεση από αγαπημένα" : "Προσθήκη στα αγαπημένα"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer (αν υπάρχει) */}
      <div className="trailer">
        <h3>Trailer:</h3>
        {trailerKey ? (
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${trailerKey}`}
            title="YouTube Trailer"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        ) : (
          <p className="no-trailer">Δεν υπάρχει διαθέσιμο trailer.</p>
        )}
      </div>

      {/* Ηθοποιοί */}
      {cast.length > 0 && (
        <div className="cast">
          <h3>Ηθοποιοί:</h3>
          <ul className="cast-list">
            {cast.map((actor) => (
              <li key={actor.id}>
                <img
                  src={
                    actor.profile_path
                      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                      : "/default-profile.png"
                  }
                  alt={actor.name}
                />
                <span>{actor.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Προτάσεις */}
      {similarMovies.length > 0 && (
        <div className="similar-movies">
          <h3>Πιθανόν να σου αρέσουν:</h3>
          <div className="movies-grid">
            {similarMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}

      {/* Ενότητα σχολίων */}
      <CommentsSection movieId={id} />
    </div>
  );
}

export default MovieDetails;
