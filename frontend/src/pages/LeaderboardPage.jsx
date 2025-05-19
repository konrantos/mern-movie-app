// Σελίδα Leaderboard με εναλλαγή μεταξύ σχολίων και πόντων

import { useEffect, useState } from "react";
import "../css/LeaderboardPage.css";

export default function LeaderboardPage() {
  const [mode, setMode] = useState("comments"); // comments ή points
  const [leaders, setLeaders] = useState([]); // λίστα χρηστών

  // Φόρτωση leaderboard ανά mode
  useEffect(() => {
    const url =
      mode === "comments"
        ? "http://localhost:5000/api/comments/leaderboard"
        : "http://localhost:5000/api/comments/points-leaderboard";
    fetch(url)
      .then((res) => res.json())
      .then(setLeaders)
      .catch(() => setLeaders([]));
  }, [mode]);

  return (
    <div className="leaderboard-page">
      {/* Τίτλος ανάλογα με το mode */}
      <h2>
        {mode === "comments"
          ? "Leaderboard Σχολιαστών"
          : "Leaderboard με Βάση Πόντων"}
      </h2>

      {/* Κουμπιά εναλλαγής mode */}
      <div className="mode-switch">
        <button
          className={mode === "comments" ? "active" : ""}
          onClick={() => setMode("comments")}
        >
          Σχόλια
        </button>
        <button
          className={mode === "points" ? "active" : ""}
          onClick={() => setMode("points")}
        >
          Πόντοι
        </button>
      </div>

      {/* Πίνακας με τα δεδομένα */}
      <div className="leaderboard-table-wrapper">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Χρήστης</th>
              <th>{mode === "comments" ? "Αριθμός Σχολίων" : "Πόντοι"}</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((p) => (
              <tr key={p.username}>
                <td className="leader-name">{p.username}</td>
                <td className="leader-count">
                  {mode === "comments" ? p.count : p.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
