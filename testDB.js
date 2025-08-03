// server/testDB.js
const pool = require('./config/db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error connecting to the database:', err);
  } else {
    console.log('✅ Connected successfully! Current time:', res.rows[0].now);
  }
  pool.end();
});
