const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'https://tune-box-frontend.vercel.app',
  'http://localhost:3000',
  'http://192.168.31.199:3000'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- Routes ---
// Mount your API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/youtube', require('./routes/youtube'));
app.use('/api/playlists', require('./routes/playlists'));

// --- Root Route (Optional, for testing if server is running) ---
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'TuneBox Backend API is running!' });
});

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});