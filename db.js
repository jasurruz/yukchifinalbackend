const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Railway va Supabase o'rtasidagi barqarorlik uchun:
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Xatolarni ushlash
pool.on('error', (err) => {
  console.error('Kutilmagan DB xatosi:', err.message);
});

module.exports = pool;