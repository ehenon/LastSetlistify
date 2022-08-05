import 'dotenv/config';

/**
 * Get missing configuration variables as a list of strings.
 * @param {*} config - Configuration object to check.
 * @returns {Array<string>} List of missing config variables.
 */
export const getMissingConfigVariables = (config) => {
  const missingVariables = [];
  for (const [key, value] of Object.entries(config)) {
    if (!value) {
      missingVariables.push(key);
    }
  }
  return missingVariables;
};

export default {
  userLogin: process.env.USER_LOGIN,
  userPassword: process.env.USER_PASSWORD,
  setlistFmApiKey: process.env.SETLISTFM_API_KEY,
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  spotifyCallbackUri: process.env.SPOTIFY_CALLBACK_URI,
  spotifyUserId: process.env.SPOTIFY_USER_ID,
};
