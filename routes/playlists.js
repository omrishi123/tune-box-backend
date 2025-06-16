const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get all playlists for a user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json(user.playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new playlist
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.userId);
    
    user.playlists.push({ name, songs: [] });
    await user.save();
    
    res.status(201).json(user.playlists[user.playlists.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add song to playlist
router.post('/:playlistId/songs', auth, async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { videoId, title, thumbnail, artist } = req.body;
    
    const user = await User.findById(req.userId);
    const playlist = user.playlists.id(playlistId);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    playlist.songs.push({ videoId, title, thumbnail, artist });
    await user.save();
    
    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete playlist
router.delete('/:playlistId', auth, async (req, res) => {
  try {
    const { playlistId } = req.params;
    const user = await User.findById(req.userId);
    
    user.playlists = user.playlists.filter(
      playlist => playlist._id.toString() !== playlistId
    );
    
    await user.save();
    res.status(200).json({ message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
