require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const pool = require("./db");

const app = express();

/* ✅ CORS FIX (ENG ISHONCHLI VARIANT)
   - Vercel origin'ni aniq ruxsat qiladi
   - OPTIONS preflight'ni darrov 204 bilan yopadi
*/
const allowedOrigins = ["https://yukchi.vercel.app"];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ Preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// ✅ JSON o‘qish
app.use(express.json());

// ✅ Health check
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
      return res.json({ status: "error", message: "Barcha maydonlarni to'ldiring!" });
    }

    const hashPass = bcrypt.hashSync(password, 10);

    await pool.query(
      "INSERT INTO users (username, password, profiletype) VALUES ($1, $2, $3)",
      [username, hashPass, profileType]
    );

    res.json({
      status: "ok",
      message: "Ro'yxatdan o'tish muvaffaqiyatli!",
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.json({
      status: "error",
      message: "Bu foydalanuvchi nomi band yoki tizimda xatolik!",
    });
  }
});

// ---------------- LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0)
      return res.json({ status: "error", message: "Foydalanuvchi topilmadi!" });

    const user = result.rows[0];

    if (!bcrypt.compareSync(password, user.password))
      return res.json({ status: "error", message: "Parol noto'g'ri!" });

    res.json({
      status: "ok",
      message: "Kirish muvaffaqiyatli!",
      username: user.username,
      profileType: user.profiletype,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ status: "error", message: "Server xatoligi" });
  }
});

// ---------------- ORDER
app.post("/order", async (req, res) => {
  try {
    const { name, phone, from_city, to_city, cargo } = req.body;

    if (!name || !phone || !from_city || !to_city) {
      return res.json({ status: "error", message: "Iltimos, barcha maydonlarni to‘ldiring" });
    }

    await pool.query(
      "INSERT INTO orders (name, phone, from_city, to_city, cargo) VALUES ($1, $2, $3, $4, $5)",
      [name, phone, from_city, to_city, cargo || ""]
    );

    res.json({ status: "ok", message: "Buyurtma qabul qilindi!" });
  } catch (err) {
    console.error("Order error:", err.message);
    res.json({ status: "error", message: "Buyurtmani saqlashda xatolik" });
  }
});

// ✅ Railway PORT
const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server ${PORT}-portda ishlamoqda`);
});