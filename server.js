const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Remove the first CORS middleware and keep only one CORS configuration
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
  res.send('TuneBox Backend API is running!');
});

// --- MongoDB Connection and Server Start ---
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Exit the process if MongoDB connection fails
    process.exit(1);
  });