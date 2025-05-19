import "./css/App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import MovieDetails from "./pages/MovieDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GenreMovies from "./pages/GenreMovies";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { MovieProvider } from "./contexts/MovieContext";
import { GenreProvider } from "./contexts/GenreContext";

function App() {
  return (
    // Περιβάλλει όλη την εφαρμογή με Movie και Genre Contexts
    <MovieProvider>
      <GenreProvider>
        <NavBar />

        {/* Κύριες σελίδες της εφαρμογής */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/genre/:genreId" element={<GenreMovies />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <Footer />
      </GenreProvider>
    </MovieProvider>
  );
}

export default App;
