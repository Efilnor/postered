const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureDbInitialized() {
  const sql = fs.readFileSync(path.join(__dirname, 'init.sql')).toString();
  await pool.query(sql);
  console.log('DB initialized');
}

module.exports = { pool, ensureDbInitialized };
