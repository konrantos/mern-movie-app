// Εισάγω τη βιβλιοθήκη axios για πιο εύχρηστες HTTP κλήσεις,
// καθώς τη χρησιμοποιούσε και το tutorial
import axios from "axios";

// Το API Key από το TMDB
const API_KEY = "your-api-key";
const BASE_URL = "https://api.themoviedb.org/3";

// Χρησιμοποιώ "en-US" αντί για "el-GR" επειδή σε πολλές ταινίες
// το TMDB API δεν επιστρέφει περιγραφή, trailer ή cast στα ελληνικά καποιες φορές,
// με αποτέλεσμα να μην εμφανίζονται στην εφαρμογή.
// Πλεον οτι υπάρχει στα ελληνικά στην βάση εμφανιζεται κανονικά, ενώ ότι όχι στα αγγλικά

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: "en-US"
  }
});

// Δημοφιλείς ταινίες
export const getPopularMovies = async () => {
  const response = await api.get("/movie/popular");
  return response.data.results;
};

// Αναζήτηση ταινιών με βάση τον τίτλο
export const searchMovies = async (query) => {
  const response = await api.get("/search/movie", {
    params: { query }
  });
  return response.data.results;
};

// Λεπτομέρειες ταινίας (τίτλος, περίληψη, εικόνα κ.λπ.)
export const getMovieDetails = async (id) => {
  const response = await axios.get(`${BASE_URL}/movie/${id}`, {
    params: {
      api_key: API_KEY,
      language: "en-US"
    }
  });
  return response.data;
};

// Επίσημο trailer ταινίας από το YouTube (αν υπάρχει)
export const getMovieTrailer = async (id) => {
  const response = await axios.get(`${BASE_URL}/movie/${id}/videos`, {
    params: {
      api_key: API_KEY,
      language: "en-US"
    }
  });

  const videos = response.data.results;

  const trailer = videos.find(
    (video) =>
      video.type === "Trailer" &&
      video.site === "YouTube" &&
      (video.official === true ||
        video.name.toLowerCase().includes("official"))
  );

  if (!trailer) {
    return videos.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );
  }

  return trailer;
};

// Συντελεστές ταινίας (κυρίως ηθοποιοί)
export const getMovieCredits = async (id) => {
  const response = await axios.get(`${BASE_URL}/movie/${id}/credits`, {
    params: {
      api_key: API_KEY,
      language: "en-US"
    }
  });
  return response.data.cast;
};

// Λίστα ειδών ταινιών (Genres)
export const getGenres = async () => {
  const response = await api.get("/genre/movie/list");
  return response.data.genres;
};

// Ταινίες με βάση συγκεκριμένο είδος
export const getMoviesByGenre = async (genreId) => {
  const response = await api.get("/discover/movie", {
    params: {
      with_genres: genreId
    }
  });
  return response.data.results;
};

// Όλα τα διαθέσιμα είδη (για dropdown ή φίλτρο)
export const getAllGenres = async () => {
  const response = await api.get("/genre/movie/list");
  return response.data.genres;
};


// Παρόμοιες ταινίες (με βάση ID)
export const getSimilarMovies = async (id) => {
  const response = await axios.get(`${BASE_URL}/movie/${id}/similar`, {
    params: {
      api_key: API_KEY,
      language: "en-US"
    }
  });
  return response.data.results;
};

// Ταινίες με υψηλή βαθμολογία (Top Rated)
export const getTopRatedMovies = async () => {
  const response = await api.get("/movie/top_rated");
  return response.data.results;
};

// Ταινίες που προβάλλονται τώρα στους κινηματογράφους (Now Playing)
export const getNowPlayingMovies = async () => {
  const response = await api.get("/movie/now_playing");
  return response.data.results;
};


export const discoverMovies = async ({ genre, rating, yearMin, yearMax }) => {
  const params = {
    api_key: API_KEY,
    language: "en-US",
    sort_by: "popularity.desc",
    include_adult: false,
    page: 1,
  };

  if (genre) params.with_genres = genre;
  if (rating) params["vote_average.gte"] = parseFloat(rating);
  if (yearMin) params["primary_release_date.gte"] = `${yearMin}-01-01`;
  if (yearMax) params["primary_release_date.lte"] = `${yearMax}-12-31`;

  const response = await api.get("/discover/movie", { params });
  return response.data.results;
};

