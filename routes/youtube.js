const express = require('express');
const router = express.Router();
const ytdl = require('ytdl-core');
const { google } = require('googleapis');
const axios = require('axios');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// Add caching
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    // Validate query parameter
    if (!query) {
      return res.status(400).json({ 
        error: 'Query parameter is required',
        code: 'MISSING_QUERY'
      });
    }

    // Validate API key
    if (!process.env.YOUTUBE_API_KEY) {
      console.error('YouTube API key is missing in env variables');
      return res.status(500).json({ 
        error: 'YouTube API key is not configured',
        code: 'MISSING_API_KEY'
      });
    }

    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          maxResults: 20,
          key: process.env.YOUTUBE_API_KEY,
          q: query + ' song',
          type: 'video',
          videoCategoryId: '10'
        },
        timeout: 10000 // 10 second timeout
      });

      if (!response.data?.items) {
        console.log('Empty response from YouTube API');
        return res.status(200).json([]);
      }

      const videos = response.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        artist: item.snippet.channelTitle
      }));

      return res.json(videos);

    } catch (apiError) {
      console.error('YouTube API Error:', {
        status: apiError.response?.status,
        data: apiError.response?.data,
        message: apiError.message
      });

      if (apiError.response?.status === 403) {
        return res.status(403).json({
          error: 'YouTube API quota exceeded or invalid key',
          code: 'API_QUOTA_ERROR'
        });
      }

      throw apiError; // Let the outer catch handle other errors
    }

  } catch (error) {
    console.error('Search endpoint error:', {
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      error: 'Failed to search videos',
      code: 'SEARCH_ERROR',
      message: error.message
    });
  }
});

// Add trending music videos route
router.get('/trending', async (req, res) => {
  try {
    if (cache.has('trending')) {
      const { data, timestamp } = cache.get('trending');
      if (Date.now() - timestamp < CACHE_DURATION) {
        return res.json(data);
      }
    }

    const response = await youtube.videos.list({
      part: 'snippet,statistics',
      chart: 'mostPopular',
      videoCategoryId: '10', // Music category
      maxResults: 20
    });

    cache.set('trending', {
      data: response.data.items,
      timestamp: Date.now()
    });

    res.json(response.data.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add video details route
router.get('/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const cacheKey = `video_${videoId}`;

    if (cache.has(cacheKey)) {
      const { data, timestamp } = cache.get(cacheKey);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return res.json(data);
      }
    }

    const response = await youtube.videos.list({
      part: 'snippet,contentDetails,statistics',
      id: videoId
    });

    if (!response.data.items.length) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const videoData = response.data.items[0];
    cache.set(cacheKey, {
      data: videoData,
      timestamp: Date.now()
    });

    res.json(videoData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enhance stream route with better error handling
router.get('/stream/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const info = await ytdl.getInfo(videoId);
    
    const audioFormat = ytdl.chooseFormat(info.formats, { 
      quality: 'highestaudio',
      filter: 'audioonly' 
    });

    if (!audioFormat) {
      return res.status(404).json({ message: 'No audio format found' });
    }

    const videoData = {
      url: audioFormat.url,
      title: info.videoDetails.title,
      duration: info.videoDetails.lengthSeconds,
      author: info.videoDetails.author.name
    };

    res.json(videoData);
  } catch (error) {
    if (error.message.includes('age-restricted')) {
      return res.status(403).json({ message: 'Age restricted content' });
    }
    if (error.message.includes('private')) {
      return res.status(403).json({ message: 'Private video' });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
