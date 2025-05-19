const API = "http://localhost:5000/api/auth";

// POST /api/auth/login
// Είσοδος χρήστη (username, password)
export const loginUser = async (payload) => {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // στέλνει cookie στον server
    body: JSON.stringify(payload),
  });
  return res.json();
};

// POST /api/auth/logout
// Αποσύνδεση χρήστη (διαγράφει cookie)
export const logoutUser = async () => {
  const res = await fetch(`${API}/logout`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
};

// GET /api/auth/me
// Επιστρέφει τον συνδεδεμένο χρήστη (βάσει cookie)
export const getMe = async () => {
  const res = await fetch(`${API}/me`, {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};
