// Εμφανίζει τα σχόλια μιας ταινίας και επιτρέπει την προσθήκη νέου σχολίου

import { useState, useEffect } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import "../css/CommentsSection.css";

function CommentsSection({ movieId }) {
  const { username, incrementCommentCount } = useMovieContext();

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  // Φορτώνει τα σχόλια για τη συγκεκριμένη ταινία
  useEffect(() => {
    fetch(`http://localhost:5000/api/comments/${movieId}`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((arr) => setComments(Array.isArray(arr) ? arr : []))
      .catch(() => setComments([]));
  }, [movieId]);

  // Υποβάλλει νέο σχόλιο στο backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      alert("Πρέπει να είσαι συνδεδεμένος για να σχολιάσεις.");
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    const res = await fetch(`http://localhost:5000/api/comments/${movieId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, text: trimmed }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Σφάλμα αποστολής σχολίου");
      return;
    }

    const { comment } = await res.json();
    setComments((c) => [comment, ...c]);
    setText("");
    incrementCommentCount();
  };

  return (
    <div className="comments-section">
      <h3>Σχόλια</h3>

      {/* Φόρμα προσθήκης νέου σχολίου */}
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          placeholder="Γράψε το σχόλιό σου..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <button type="submit">Αποστολή</button>
      </form>

      {/* Λίστα σχολίων */}
      {comments.length > 0 ? (
        <ul className="comments-list">
          {comments.map((c) => (
            <li key={c._id} className="comment-item">
              <div className="comment-header">
                <strong>{c.userId.username}</strong>{" "}
                <span>
                  {new Date(c.createdAt).toLocaleDateString()}{" "}
                  {new Date(c.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="comment-text">{c.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-comments">Δεν υπάρχουν σχόλια.</p>
      )}
    </div>
  );
}

export default CommentsSection;
