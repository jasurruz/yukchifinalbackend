const { Pool } = require("pg");

const pool = new Pool({
  // Railway'dagi DATABASE_URL o'zgaruvchisidan hamma ma'lumotni oladi
  connectionString: process.env.DATABASE_URL, 
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
