// Σελίδα σύνδεσης χρήστη

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../css/Login.css";
import { useMovieContext } from "../contexts/MovieContext";

function Login() {
  const [username, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUsername } = useMovieContext(); // χρήση context για αποθήκευση username

  // Υποβολή φόρμας σύνδεσης
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      // Αποθήκευση token και username
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", username);
      setUsername(username);
      navigate("/");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Σφάλμα κατά τη σύνδεση");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Σύνδεση</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Όνομα χρήστη"
            value={username}
            onChange={(e) => setUsernameInput(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Κωδικός"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Είσοδος</button>
        </form>

        {/* Σύνδεσμος προς εγγραφή */}
        <p>
          Δεν έχετε λογαριασμό;{" "}
          <Link to="/register">
            <span>Εγγραφή</span>
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
