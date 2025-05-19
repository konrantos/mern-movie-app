// Σελίδα που εμφανίζει τις αγαπημένες ταινίες του χρήστη

import "../css/Favorites.css";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";

function Favorites() {
  const { favorites, isLoaded, username } = useMovieContext();

  // Αν δεν υπάρχει χρήστης, εμφάνιση κενού μηνύματος
  if (!username) {
    return (
      <div className="favorites-empty">
        <h2>Δεν υπάρχουν ακόμα αγαπημένες ταινίες</h2>
        <p>
          Ξεκινήστε να προσθέτετε ταινίες στα αγαπημένα σας και θα εμφανιστούν
          εδώ!
        </p>
      </div>
    );
  }

  // Αν δεν έχουν φορτωθεί ακόμα τα αγαπημένα
  if (!isLoaded) {
    return <div className="favorites-empty">Φόρτωση αγαπημένων...</div>;
  }

  // Αν είμαστε συνδεδεμένοι αλλά δεν υπάρχουν αγαπημένες
  if (favorites.length === 0) {
    return (
      <div className="favorites-empty">
        <h2>Δεν υπάρχουν ακόμα αγαπημένες ταινίες</h2>
        <p>
          Ξεκινήστε να προσθέτετε ταινίες στα αγαπημένα σας και θα εμφανιστούν
          εδώ!
        </p>
      </div>
    );
  }

  // Κανονική εμφάνιση αγαπημένων
  return (
    <div className="favorites">
      <h2>Οι αγαπημένες σου ταινίες:</h2>
      <div className="movies-grid">
        {favorites
          .filter((movie) => movie && movie.id)
          .map((movie) => (
            <MovieCard movie={movie} key={movie.id} />
          ))}
      </div>
    </div>
  );
}

export default Favorites;
