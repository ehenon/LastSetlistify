require('dotenv').config();

module.exports = {
  setlistFmApiKey: process.env.SETLISTFM_API_KEY,
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  spotifyCallbackUri: process.env.SPOTIFY_CALLBACK_URI,
  spotifyUserId: process.env.SPOTIFY_USER_ID,
};
