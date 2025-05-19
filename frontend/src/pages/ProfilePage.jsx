// Σελίδα Προφίλ Χρήστη

import { useEffect, useState } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import { useGenreContext } from "../contexts/GenreContext";
import { useNavigate } from "react-router-dom";
import "../css/ProfilePage.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Χρώματα για το γράφημα
const COLORS = [
  "#8884d8",
  "#8dd1e1",
  "#82ca9d",
  "#a4de6c",
  "#d0ed57",
  "#ffc658",
  "#ff8042",
  "#d88884",
  "#e18dd1",
  "#cad182",
  "#de6ca4",
  "#ed57d0",
];

export default function ProfilePage() {
  const {
    username,
    isLoaded,
    favorites = [],
    commentCount = 0,
  } = useMovieContext();
  const { genres } = useGenreContext();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Φόρτωση στοιχείων χρήστη (τρέχει και όταν αλλάζει ο αριθμός σχολίων)
  useEffect(() => {
    if (!isLoaded) return;
    if (!username) {
      navigate("/login");
      return;
    }
    fetch(`http://localhost:5000/api/users/${username}`, {
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setUserData(data);
        setSelectedGenres(data.preferredGenres || []);
      })
      .catch(() => setUserData(null))
      .finally(() => setHasFetched(true));
  }, [username, isLoaded, navigate, commentCount]);

  // Υπολογισμός πόντων από αγαπημένα και σχόλια
  const bonusFav = favorites.length * 1;
  const bonusComment = commentCount * 2;

  // Υπολογισμός επιπέδου και progress bar
  const { level = 1, points = 0, genreStats = {} } = userData || {};
  const inLevel = points % 10;
  const progressPct = (inLevel / 10) * 100;
  const hue = (progressPct * 120) / 100;
  const progressColor = `hsl(${hue},70%,50%)`;
  const nextLevel = level + 1;

  // Επιλογή/αφαίρεση αγαπημένων ειδών
  const toggleGenre = (id) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
    setSaveMessage("");
  };

  // Αποθήκευση προτιμήσεων στο backend
  const handleSavePreferences = () => {
    setSaving(true);
    fetch(`http://localhost:5000/api/users/${username}/preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ preferredGenres: selectedGenres }),
    })
      .then((r) => r.json())
      .then((data) => {
        setSelectedGenres(data.preferredGenres || []);
        setSaveMessage("Οι προτιμήσεις αποθηκεύτηκαν επιτυχώς!");
      })
      .catch(() => {
        setSaveMessage("Σφάλμα κατά την αποθήκευση. Προσπαθήστε ξανά.");
      })
      .finally(() => setSaving(false));
  };

  // Κατάσταση φόρτωσης ή αποτυχίας
  if (!username) {
    return (
      <div className="profile-empty">
        <h2>Δεν είστε συνδεδεμένος χρήστης</h2>
        <p>Παρακαλώ κάντε login για να δείτε το προφίλ σας.</p>
      </div>
    );
  }
  if (!isLoaded || !hasFetched) {
    return <div className="profile-empty">Φόρτωση προφίλ…</div>;
  }
  if (!userData) {
    return (
      <div className="profile-empty">
        <h2>Δεν βρέθηκε προφίλ χρήστη</h2>
      </div>
    );
  }

  // Προετοιμασία δεδομένων για το γράφημα
  const entries = Object.entries(genreStats);
  const pieData = entries.map(([genreId, count]) => ({
    name: genres.find((g) => g.id === +genreId)?.name || `ID ${genreId}`,
    value: count,
  }));

  return (
    <div className="profile-container">
      {/* Εμφάνιση πληροφοριών χρήστη */}
      <div className="profile-info-box">
        <div className="points-bonus">
          +{bonusComment} σχόλια +{bonusFav} αγαπημένα
        </div>
        <h2>Προφίλ Χρήστη</h2>
        <div className="profile-info">
          <div className="points-info">
            +1 για προσθήκη αγαπημένων
            <br />
            +2 για κάθε σχόλιο
          </div>
          <p>
            <strong>Όνομα Χρήστη:</strong> {username}
          </p>
          <p>
            <strong>Επίπεδο:</strong> {level}
          </p>
          <p>
            <strong>Πόντοι:</strong> {points}
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progressPct}%`,
                backgroundColor: progressColor,
              }}
            />
            <span className="next-level">Level {nextLevel}</span>
          </div>
        </div>
      </div>

      {/* Επιλογή αγαπημένων ειδών */}
      <div className="preferences-box">
        <h3>Αγαπημένα Είδη</h3>
        <div className="genre-buttons">
          {genres.map((g) => (
            <button
              key={g.id}
              className={`genre-button ${
                selectedGenres.includes(g.id) ? "selected" : ""
              }`}
              onClick={() => toggleGenre(g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>
        <button
          className="auth-button"
          onClick={handleSavePreferences}
          disabled={saving}
        >
          {saving ? "Αποθήκευση…" : "Αποθήκευση Προτιμήσεων"}
        </button>
        {saveMessage && <p className="save-message">{saveMessage}</p>}
      </div>

      {/* Στατιστικά εμφάνισης ανά είδος */}
      {pieData.length > 0 && (
        <div className="stats-box">
          <h3>Στατιστικά Ειδών Παρακολούθησης</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={100}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}`, "Ταινίες"]} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
