const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// --- CORS Configuration ---
// Define the allowed origins for your frontend.
// IMPORTANT: Replace 'https://tune-box-frontend.vercel.app' with your actual deployed frontend URL.
const allowedOrigins = [
  'https://tune-box-frontend.vercel.app', // Your deployed Vercel frontend URL
  'http://localhost:3000',               // For local development of your frontend (e.g., Create React App default)
  'http://192.168.31.199:3000'           // If you access your local frontend from another device on your network
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (e.g., file://, Postman, curl, or same-origin requests)
    // This is generally safe as browsers won't send an Origin header for these types of requests.
    if (!origin) return callback(null, true);

    // Check if the requesting origin is in our allowed list
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    // If the origin is allowed, proceed
    return callback(null, true);
  },
  credentials: true, // This is crucial if your frontend sends cookies, authorization headers, etc.
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'], // Explicitly allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'], // Explicitly allowed request headers
}));

// Middleware to parse JSON request bodies
app.use(express.json());

// --- Routes ---
// Mount your API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/youtube', require('./routes/youtube'));
app.use('/api/playlists', require('./routes/playlists'));

// --- Root Route (Optional, for testing if server is running) ---
app.get('/', (req, res) => {
  res.send('TuneBox Backend API is running!');
});

// --- MongoDB Connection and Server Start ---
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // '0.0.0.0' makes the server listen on all network interfaces.
                                            // This is important for Vercel, as it doesn't assign a specific host IP.

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the Express server
    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
      // On Vercel, the actual public URL will be provided by Vercel.
      // This console log will appear in your Vercel deployment logs.
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Exit the process if MongoDB connection fails
    process.exit(1);
  });