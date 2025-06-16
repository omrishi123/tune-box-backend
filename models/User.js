const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  playlists: [{
    name: String,
    songs: [{
      videoId: String,
      title: String,
      thumbnail: String,
      artist: String
    }]
  }],
  likedSongs: [{
    videoId: String,
    title: String,
    thumbnail: String,
    artist: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
