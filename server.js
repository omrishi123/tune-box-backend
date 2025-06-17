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
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/youtube', require('./routes/youtube'));
app.use('/api/playlists', require('./routes/playlists'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, process.env.HOST, () => {
      console.log(`Server running on http://${process.env.HOST}:${process.env.PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
    console.log('Connected to MongoDB');
    app.listen(PORT, process.env.HOST, () => {
      console.log(`Server running on http://${process.env.HOST}:${process.env.PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
