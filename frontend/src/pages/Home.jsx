// Αρχική σελίδα με αναζήτηση, φίλτρα, sliders για δημοφιλείς, είδη, προβολές και κορυφαίες ταινίες

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Slider from "react-slick";
import {
  searchMovies,
  discoverMovies,
  getPopularMovies,
  getGenres,
  getMoviesByGenre,
  getTopRatedMovies,
  getNowPlayingMovies,
} from "../services/api";
import MovieCard from "../components/MovieCard";
import SearchBar from "../components/SearchBar";
import { useMovieContext } from "../contexts/MovieContext";
import "../css/Home.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Προκαθορισμένα είδη για εμφάνιση
const STATIC_GENRES = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 10749, name: "Romance" },
  { id: 18, name: "Drama" },
];

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, isLoaded } = useMovieContext();

  // Ανάγνωση παραμέτρων από το URL
  const params = new URLSearchParams(location.search);
  const queryParam = params.get("q") || "";
  const genreParam = params.get("genre") || "";
  const ratingParam = params.get("rating") || "";
  const yearMinParam = +params.get("yearMin") || 1950;
  const yearMaxParam = +params.get("yearMax") || 2025;

  // Κατάσταση φίλτρων και αναζήτησης
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedGenre, setSelectedGenre] = useState(genreParam);
  const [minRating, setMinRating] = useState(ratingParam);
  const [yearMin, setYearMin] = useState(yearMinParam);
  const [yearMax, setYearMax] = useState(yearMaxParam);

  // Κατάσταση δεδομένων
  const [genres, setGenres] = useState([]);
  const [popular, setPopular] = useState([]);
  const [defaultSections, setDefaultSections] = useState({});
  const [nowPlaying, setNowPlaying] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  // Προτιμήσεις χρήστη
  const [preferredGenres, setPreferredGenres] = useState([]);
  const [preferredSections, setPreferredSections] = useState({});
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  // Κατάσταση UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync παραμέτρων URL με local state
  useEffect(() => {
    setSearchQuery(queryParam);
    setSelectedGenre(genreParam);
    setMinRating(ratingParam);
    setYearMin(yearMinParam);
    setYearMax(yearMaxParam);
  }, [queryParam, genreParam, ratingParam, yearMinParam, yearMaxParam]);

  // Ενημέρωση URL με βάση αλλαγές φίλτρων
  const updateParams = (updates) => {
    const p = new URLSearchParams(location.search);
    Object.entries(updates).forEach(([k, v]) => {
      if (v == null || v === "") p.delete(k);
      else p.set(k, v);
    });
    navigate(`?${p.toString()}`);
  };

  // 1) Φόρτωση genres, δημοφιλών, στατικών ειδών, now playing και top rated
  useEffect(() => {
    (async () => {
      try {
        const [genresList, pop] = await Promise.all([
          getGenres(),
          getPopularMovies(),
        ]);
        setGenres(genresList);
        setPopular(pop);

        const secs = {};
        for (let g of STATIC_GENRES) {
          secs[g.id] = await getMoviesByGenre(g.id);
        }
        setDefaultSections(secs);

        const [now, top] = await Promise.all([
          getNowPlayingMovies(),
          getTopRatedMovies(),
        ]);
        setNowPlaying(now.slice(0, 20));
        setTopRated(top.slice(0, 20));
      } catch {
        setError("Αποτυχία φόρτωσης δεδομένων.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) Φόρτωση preferredGenres από backend
  useEffect(() => {
    if (!isLoaded) return;
    if (!username) {
      setPreferredGenres([]);
      setLoadingPrefs(false);
      return;
    }
    fetch(`http://localhost:5000/api/users/${username}`)
      .then((res) => res.json())
      .then((data) => setPreferredGenres(data.preferredGenres || []))
      .catch(() => setPreferredGenres([]))
      .finally(() => setLoadingPrefs(false));
  }, [isLoaded, username]);

  // 3) Δημιουργία preferred sections βάσει genres του χρήστη
  useEffect(() => {
    if (loadingPrefs) return;
    if (preferredGenres.length === 0) {
      setPreferredSections({});
      return;
    }
    (async () => {
      const secs = {};
      for (let gid of preferredGenres.slice(0, STATIC_GENRES.length)) {
        secs[gid] = await getMoviesByGenre(gid);
      }
      setPreferredSections(secs);
    })();
  }, [loadingPrefs, preferredGenres]);

  // 4) Αναζήτηση & φιλτράρισμα ταινιών
  useEffect(() => {
    const hasQ = queryParam.trim() !== "";
    const hasFilter =
      selectedGenre || minRating || yearMin !== 1950 || yearMax !== 2025;
    if (!hasQ && !hasFilter) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        let res = [];
        if (hasQ) {
          res = await searchMovies(queryParam);
          if (selectedGenre)
            res = res.filter((m) => m.genre_ids?.includes(+selectedGenre));
          if (minRating) res = res.filter((m) => m.vote_average >= +minRating);
          res = res.filter((m) => {
            const y = +m.release_date?.split("-")[0];
            return y >= yearMin && y <= yearMax;
          });
        } else {
          res = await discoverMovies({
            genre: selectedGenre,
            rating: minRating,
            yearMin,
            yearMax,
          });
        }
        setSearchResults(res);
        setError(null);
      } catch {
        setError("Αποτυχία αναζήτησης.");
      } finally {
        setLoading(false);
      }
    })();
  }, [queryParam, selectedGenre, minRating, yearMin, yearMax]);

  // Έλεγχος ενεργών φίλτρων/αναζήτησης
  const isActive =
    queryParam ||
    selectedGenre ||
    minRating ||
    yearMin !== 1950 ||
    yearMax !== 2025;

  // Ρυθμίσεις slider
  const sliderSettings = {
    infinite: false,
    slidesToShow: 6,
    slidesToScroll: 2,
    arrows: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 5 } },
      { breakpoint: 992, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 576, settings: { slidesToShow: 2 } },
    ],
  };

  // Scroll σε section με hash #now-playing
  useEffect(() => {
    if (location.hash === "#now-playing") {
      document
        .getElementById("now-playing")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  return (
    <div className="home">
      {/* Μήνυμα καλωσορίσματος */}
      {username && <h2 className="welcome">Καλωσόρισες, {username}!</h2>}

      {/* Μπάρα αναζήτησης + φίλτρα */}
      <SearchBar
        searchQuery={searchQuery}
        onQueryChange={(e) => setSearchQuery(e.target.value)}
        onQuerySubmit={(e) => {
          e.preventDefault();
          updateParams({ q: searchQuery });
        }}
        selectedGenre={selectedGenre}
        onGenreChange={(val) => updateParams({ genre: val })}
        minRating={minRating}
        onRatingChange={(val) => updateParams({ rating: val })}
        yearMin={yearMin}
        onYearMinChange={(val) => updateParams({ yearMin: val })}
        yearMax={yearMax}
        onYearMaxChange={(val) => updateParams({ yearMax: val })}
        onClear={() =>
          updateParams({
            q: "",
            genre: "",
            rating: "",
            yearMin: "1950",
            yearMax: "2025",
          })
        }
      />

      {/* Dropdown αλλαγής είδους */}
      <div className="genre-filter">
        <h2 style={{ color: "white" }}>Διάλεξε είδος ταινίας:</h2>
        <select
          className="genre-select"
          onChange={(e) => navigate(`/genre/${e.target.value}`)}
          defaultValue=""
        >
          <option value="">Επιλογή είδους</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* Λήψη σφαλμάτων ή περιεχομένου */}
      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Φόρτωση...</div>
      ) : (
        <>
          <h2 className="section-title">
            {isActive
              ? "Αποτελέσματα Αναζήτησης / Φίλτρων"
              : "Δημοφιλείς Ταινίες"}
          </h2>

          {(isActive ? searchResults : popular).length === 0 ? (
            <p className="no-results">Δεν βρέθηκαν αποτελέσματα.</p>
          ) : (
            <Slider {...sliderSettings}>
              {(isActive ? searchResults : popular).map((mv) => (
                <div key={mv.id} className="slider-item">
                  <MovieCard movie={mv} />
                </div>
              ))}
            </Slider>
          )}

          {/* Δυναμικά sections ανά είδος (με βάση user ή default) */}
          {(!loadingPrefs && preferredGenres.length > 0
            ? preferredGenres.slice(0, STATIC_GENRES.length)
            : STATIC_GENRES.map((g) => g.id)
          ).map((gid) => {
            const list =
              !loadingPrefs && preferredGenres.length > 0
                ? preferredSections[gid]
                : defaultSections[gid];
            if (!list || list.length === 0) return null;
            const name =
              !loadingPrefs && preferredGenres.length > 0
                ? genres.find((g) => g.id === gid)?.name
                : STATIC_GENRES.find((g) => g.id === gid).name;
            return (
              <section key={gid}>
                <h2 className="section-title">Δημοφιλείς {name} Ταινίες</h2>
                <Slider {...sliderSettings}>
                  {list.map((mv) => (
                    <div key={mv.id} className="slider-item">
                      <MovieCard movie={mv} />
                    </div>
                  ))}
                </Slider>
              </section>
            );
          })}

          {/* Ταινίες που προβάλλονται τώρα */}
          <h2 id="now-playing" className="section-title">
            Προβάλλονται Τώρα στους Κινηματογράφους
          </h2>
          <Slider {...sliderSettings}>
            {nowPlaying.map((mv) => (
              <div key={mv.id} className="slider-item">
                <MovieCard movie={mv} />
              </div>
            ))}
          </Slider>

          {/* Κορυφαίες όλων των εποχών */}
          <h2 className="section-title">Κορυφαίες Διαχρονικά Ταινίες</h2>
          <Slider {...sliderSettings}>
            {topRated.map((mv) => (
              <div key={mv.id} className="slider-item">
                <MovieCard movie={mv} />
              </div>
            ))}
          </Slider>
        </>
      )}
    </div>
  );
}
