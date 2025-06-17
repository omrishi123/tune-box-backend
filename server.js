const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'https://tune-box-frontend.vercel.app',
  'http://localhost:3000',
  'http://192.168.31.199:3000'
];

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  next();
});

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
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