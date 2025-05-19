// Παρέχει λίστα με τα είδη ταινιών (genres) σε όλη την εφαρμογή

import { createContext, useContext, useEffect, useState } from "react";
import { getGenres } from "../services/api";

// Δημιουργία context
const GenreContext = createContext();

// Custom hook για ευκολότερη χρήση του context
export const useGenreContext = () => useContext(GenreContext);

export const GenreProvider = ({ children }) => {
  const [genres, setGenres] = useState([]);

  // Φόρτωση των genres από το API όταν φορτωθεί το component
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getGenres();
        setGenres(data);
      } catch (err) {
        console.error("Σφάλμα κατά τη φόρτωση των ειδών:", err);
      }
    };

    fetchGenres();
  }, []);

  // Επιστρέφει το όνομα είδους με βάση το id
  const getGenreName = (id) => {
    const genre = genres.find((g) => g.id === id);
    return genre ? genre.name : "Άγνωστο";
  };

  return (
    <GenreContext.Provider value={{ genres, getGenreName }}>
      {children}
    </GenreContext.Provider>
  );
};
