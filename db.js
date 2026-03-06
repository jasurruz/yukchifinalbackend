const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Railway'dan keladigan yagona yo'l
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
