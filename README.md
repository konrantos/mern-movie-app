# MERN Movie App — Fullstack Application

> Course project for **Web Application and Database Development** (8th semester) — Department of Informatics and Telecommunications, University of Ioannina.

## 📌 Description

This is a fullstack movie web application built using the **MERN stack** (MongoDB, Express, React, Node.js).  
It allows users to explore movies, manage favorites, leave comments, and gain XP through activity.

⚠️ The majority of the code (variable names, comments, UI content) is written in **Greek**, in accordance with the course standards. No translation or refactoring is intended at this time.

📚 A **fully documented project report in Greek**, including detailed explanations and screenshots of the application, is available at the following link:  
👉 [Google Drive](https://drive.google.com/drive/folders/1-N0avUuM06oXvH_mqdB2v4IR1VKaCl3I?usp=drive_link)

## 🎯 Features

- 🔍 Search and browse movies from **TMDB API**
- ⭐ Add movies to your **Favorites**
- 💬 Comment on movies
- 📊 User profile with XP, level, preferred genres
- 🏆 Leaderboards (most comments, most points)
- 🎮 Gamification: gain XP for every comment or favorite
- 🔎 Filter movies by genre, rating, or year
- 📺 Display of similar movies
- 👤 Authentication: register, login, logout
- 📱 Responsive UI (mobile & desktop)

## 🛠️ Technologies Used

### Frontend
- React.js
- React Router
- Axios
- Recharts (for profile charts)
- CSS3, responsive design

### Backend
- Node.js + Express
- MongoDB (with Mongoose)
- JWT for authentication (via HTTP-only cookies)
- Bcrypt for password hashing

## 📁 Project Structure

```
client/
├── pages/
├── components/
├── contexts/
├── services/
└── App.jsx

server/
├── routes/
├── models/
├── middleware/
├── db.js
└── index.js
```

## ⚙️ How to Run

Clone and install both frontend and backend:

```bash
git clone https://github.com/konrantos/mern-movie-app.git
cd mern-movie-app
```

### Frontend
```bash
cd client
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
npm run start
```

Create a `.env` file in `server/` with:
```
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret
TMDB_API_KEY=your_tmdb_api_key
```

## 📝 License

MIT License

## 📌 Notes

- The application is fully functional and used as a final course project.
- All deliverables, database schemas, screenshots and design choices are documented in Greek.

