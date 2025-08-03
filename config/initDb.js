const pool = require('./db');

const query = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(100)
);
`;

pool.query(query)
  .then(() => {
    console.log('✅ users table created');
    process.exit();
  })
  .catch(err => {
    console.error('❌ Failed to create table:', err);
    process.exit(1);
  });
