// server/createUsersTable.js
const pool = require('./config/db');

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool.query(createTableQuery, (err, res) => {
  if (err) {
    console.error('❌ Error creating users table:', err);
  } else {
    console.log('✅ Users table created (or already exists)');
  }
  pool.end();
});
