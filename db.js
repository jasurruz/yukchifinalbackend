const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect((err) => {
  if (err) console.error("Ulanish xatosi:", err.stack);
  else console.log("Baza bilan muvaffaqiyatli bog'landik!");
});

module.exports = pool;
