const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'https://tune-box-frontend.vercel.app', // Your Vercel frontend URL
  'http://localhost:3000',               // For local development
  'http://192.168.31.199:3000'           // If you access from another device on your local network
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl requests, or same-origin requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // IMPORTANT: Allows cookies, authorization headers, etc.
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'], // Explicitly allow methods
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'], // Explicitly allow headers
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/youtube', require('./routes/youtube'));
app.use('/api/playlists', require('./routes/playlists'));

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Use '0.0.0.0' to listen on all network interfaces

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, HOST, () => { // Listen on HOST as well
      console.log(`Server running on http://${HOST}:${PORT}`);
      // For Vercel, this will typically just log 'Server running on http://0.0.0.0:5000'
      // The actual public URL will be provided by Vercel.
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
