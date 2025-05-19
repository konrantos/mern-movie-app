// Παρέχει context για διαχείριση χρήστη, αγαπημένων, στατιστικών και σχολίων

import { createContext, useState, useContext, useEffect } from "react";

// Δημιουργία context
const MovieContext = createContext();

// Custom hook για εύκολη πρόσβαση στο MovieContext
export const useMovieContext = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [genreStats, setGenreStats] = useState({});
  const [commentCount, setCommentCount] = useState(0);

  // Ανίχνευση ενεργής συνεδρίας χρήστη
  useEffect(() => {
    fetch("http://localhost:5000/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.username) {
          setUsername(data.user.username);
          localStorage.setItem("username", data.user.username);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  // Φόρτωση αγαπημένων και στατιστικών χρήστη
  useEffect(() => {
    if (!username) {
      setFavorites([]);
      setGenreStats({});
      setCommentCount(0);
      setIsLoaded(true);
      return;
    }

    setIsLoaded(false);

    // Αγαπημένες ταινίες
    fetch(`http://localhost:5000/api/favorites/${username}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(async (ids) => {
        const movies = await Promise.all(
          ids.map((id) =>
            fetch(
              `https://api.themoviedb.org/3/movie/${id}?api_key=dc3eff0da5540affcac01719d9f75895&language=en-US`
            )
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          )
        );
        setFavorites(
          movies.filter(Boolean).map((m) => ({
            ...m,
            genre_ids: m.genre_ids || m.genres?.map((g) => g.id) || [],
          }))
        );
      })
      .catch(() => setFavorites([]));

    // Στατιστικά και σχόλια
    fetch(`http://localhost:5000/api/users/${username}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        setGenreStats(data.genreStats || {});
        setCommentCount(data.commentCount || 0);
      })
      .catch(() => {
        setGenreStats({});
        setCommentCount(0);
      })
      .finally(() => setIsLoaded(true));
  }, [username]);

  // Αποστολή στατιστικών είδους (click/favorite)
  const postStats = async (endpoint, genreIds) => {
    try {
      const r = await fetch(
        `http://localhost:5000/api/users/${username}/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ genreIds }),
        }
      );
      if (!r.ok) throw new Error();
      const { genreStats: updated } = await r.json();
      setGenreStats(updated);
    } catch (err) {
      console.error("Stat update failed", err);
    }
  };

  // Καταγραφή κλικ σε είδος
  const incrementClick = (genreIds = []) => {
    if (!username) return;
    postStats("genre-click", genreIds);
  };

  // Προσθήκη ταινίας στα αγαπημένα και ενημέρωση στατιστικών
  const addToFavorites = async (movie) => {
    if (!username) {
      alert("Πρέπει να είσαι συνδεδεμένος για να προσθέσεις στα αγαπημένα.");
      return;
    }
    setFavorites((f) => [...f, movie]);
    await fetch(`http://localhost:5000/api/favorites/${username}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId: movie.id }),
    });
    postStats("genre-favorite", movie.genre_ids);
  };

  // Αφαίρεση ταινίας από τα αγαπημένα
  const removeFromFavorites = async (id) => {
    setFavorites((f) => f.filter((m) => m.id !== id));
    await fetch(`http://localhost:5000/api/favorites/${username}/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).catch(console.error);
  };

  // Αύξηση μετρητή σχολίων κατά 1
  const incrementCommentCount = () => {
    setCommentCount((c) => c + 1);
  };

  // Έλεγχος αν μια ταινία είναι στα αγαπημένα
  const isFavorite = (id) => favorites.some((m) => m.id === id);

  return (
    <MovieContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        username,
        setUsername,
        isLoaded,
        genreStats,
        incrementClick,
        commentCount,
        incrementCommentCount,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};
