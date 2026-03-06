require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const pool = require("./db"); // db.js faylingizdan chaqiramiz
const app = express();

// CORS va JSON sozlamalari
app.use(cors());
app.use(express.json());

// ✅ Health check (Baza ishlayaptimi?)
app.get("/health", async (req, res) => {
  try {
    const r = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: r.rows[0].now });
  } catch (err) {
    console.error("DB ulanish xatosi:", err.message);
    res.status(500).json({ ok: false, message: "DB ulanmagan: " + err.message });
  }
});

// ---------------- SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { username, password, profileType } = req.body;
    if (!username || !password || !profileType) {
      return res.status(400).json({ status: "error", message: "Barcha maydonlarni to'ldiring!" });
    }
    const hashPass = bcrypt.hashSync(password, 10);
    await pool.query(
      "INSERT INTO users (username, password, profiletype) VALUES ($1, $2, $3)",
      [username, hashPass, profileType]
    );
    res.json({ status: "ok", message: "Ro'yxatdan o'tish muvaffaqiyatli!" });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ status: "error", message: "Ro'yxatdan o'tishda xatolik: " + err.message });
  }
});

// ---------------- LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ status: "error", message: "Foydalanuvchi topilmadi!" });
    }
    
    const user = result.rows[0];
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ status: "error", message: "Parol noto'g'ri!" });
    }
    
    res.json({
      status: "ok",
      username: user.username,
      profileType: user.profiletype,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ status: "error", message: "Server xatoligi: " + err.message });
  }
});

// Portni sozlash
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server ${PORT}-portda ishlamoqda`);
});
