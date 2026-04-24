require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

app.use(cors());
app.use(express.json());

// Register Route
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.run(query, [username, email, hashedPassword], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Email already exists' });
        }
        return res.status(500).json({ message: 'Database error' });
      }
      res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  const query = `SELECT * FROM users WHERE email = ?`;
  db.get(query, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  });
});

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ message: 'Token is not valid' });
  }
};

// Example Protected Route
app.get('/api/user', auth, (req, res) => {
  const query = `SELECT id, username, email FROM users WHERE id = ?`;
  db.get(query, [req.user.userId], (err, user) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json(user);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
