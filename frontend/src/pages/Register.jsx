// Σελίδα Εγγραφής Χρήστη

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/register.css";

function Register() {
  // Αρχικά δεδομένα της φόρμας
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  // Ενημέρωση των πεδίων της φόρμας
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Υποβολή φόρμας εγγραφής
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Εγγραφή επιτυχής");
      navigate("/login");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Εγγραφή Χρήστη</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          value={formData.username}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          value={formData.email}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          value={formData.password}
          required
        />
        <button type="submit" className="auth-button">
          Εγγραφή
        </button>
      </form>

      {/* Σύνδεσμος για ήδη εγγεγραμμένους χρήστες */}
      <p>
        Έχετε ήδη λογαριασμό; <Link to="/login">Σύνδεση</Link>
      </p>
    </div>
  );
}

export default Register;
