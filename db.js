// db.js
const { Pool } = require("pg");

const pool = new Pool({
  // Railway o'zi taqdim etgan DATABASE_URL ni ishlatadi
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
