const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);

// Root
app.get('/', (req, res) => {
  res.send('Welcome to SkillSync API!');
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
