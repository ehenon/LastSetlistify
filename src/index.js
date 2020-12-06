const setlistfm = require('setlistfm-js');
const SpotifyWebApi = require('spotify-web-api-node');
const open = require('open');
const http = require('http');
const url = require('url');
const artists = require('../artists.json');
const logger = require('./services/logger');
const config = require('./config');

if (!config.setlistFmApiKey) {
  logger.error('Setlist.fm API key is missing in the environment variables');
  process.exit();
}

if (!config.spotifyClientId) {
  logger.error('Spotify Client Id is missing in the environment variables');
  process.exit();
}

if (!config.spotifyClientSecret) {
  logger.error('Spotify Client Secret is missing in the environment variables');
  process.exit();
}

if (!config.spotifyCallbackUri) {
  logger.error('Spotify Callback Uri is missing in the environment variables');
  process.exit();
}

if (!config.spotifyUserId) {
  logger.error('Spotify User Id is missing in the environment variables');
  process.exit();
}

let spotifyApi;
try {
  spotifyApi = new SpotifyWebApi({
    clientId: config.spotifyClientId,
    clientSecret: config.spotifyClientSecret,
    redirectUri: config.spotifyCallbackUri,
  });
} catch (e) {
  logger.error('An error occurred while connecting to the Spotify API: ', e);
  process.exit();
}

let setlistfmClient;
try {
  // eslint-disable-next-line new-cap
  setlistfmClient = new setlistfm({
    key: config.setlistFmApiKey,
    format: 'json',
    language: 'en',
  });
} catch (e) {
  logger.error(`An error occurred while connecting to the Setlist.fm API: ${e.message}`);
  process.exit();
}

const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generatePlaylists = async (code) => {
  try {
    const token = await spotifyApi.authorizationCodeGrant(code);
    spotifyApi.setAccessToken(token.body.access_token);
    spotifyApi.setRefreshToken(token.body.refresh_token);

    for (const artist of artists) {
      logger.info(`Starting process for ${artist.name}`);
      const setlists = await setlistfmClient.getArtistSetlists(artist.mbid, { p: 1 });
      const lastEventDate = setlists.setlist[0].eventDate;
      const sets = setlists.setlist[0].sets.set;
      const songs = [];
      sets.forEach((set) => { songs.push(...set.song); });

      const searchPlaylists = await spotifyApi.getUserPlaylists(
        config.spotifyUserId,
        { limit: 50 },
      );
      const existingPlaylists = searchPlaylists.body.items;

      if (songs.length > 9 && !existingPlaylists.some((p) => p.name === `${artist.name} live ${lastEventDate}`)) {
        const playlistsToRemove = existingPlaylists.filter((p) => p.name.startsWith(`${artist.name} live `));
        if (playlistsToRemove.length > 0) {
          for (const playlist of playlistsToRemove) {
            logger.info(`- Removing the '${playlist.name}' playlist...`);
            await spotifyApi.unfollowPlaylist(playlist.id);
          }
        }

        const songsUri = [];

        for (const song of songs) {
          const search = await spotifyApi.searchTracks(`track:${song.name} artist:${artist.name}`, { limit: 1 });
          const tracks = search.body.tracks.items;
          if (tracks.length > 0) {
            songsUri.push(tracks[0].uri);
          } else if (song.cover && song.cover.name) {
            const coverSearch = await spotifyApi.searchTracks(`track:${song.name} artist:${song.cover.name}`, { limit: 1 });
            const coverTracks = coverSearch.body.tracks.items;
            if (coverTracks.length > 0) {
              songsUri.push(coverTracks[0].uri);
            }
          }
        }

        if (songsUri.length > 0) {
          const playlistName = `${artist.name} live ${lastEventDate}`;
          logger.info(`- Creating '${playlistName}' playlist...`);
          const createdPlaylist = await spotifyApi.createPlaylist(
            config.spotifyUserId, playlistName,
            { public: false },
          );
          await spotifyApi.addTracksToPlaylist(createdPlaylist.body.id, songsUri);
        }
      } else {
        logger.info(`- There is no new playlist to create for ${artist.name}`);
      }
      await sleep(1000);
    }
    logger.info('The playlist generation process was completed without any errors');
  } catch (e) {
    logger.error('An error occurred while generating the playlists: ', e);
  }
};

http.createServer(async (request, response) => {
  const urlParse = url.parse(request.url, true);
  if (urlParse.pathname && urlParse.pathname === '/callback') {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end('The local server has retrieved the authentication code and continues executing the script... You can close this tab! ;-)');
    await generatePlaylists(urlParse.query.code);
    process.exit();
  } else {
    response.writeHead(204);
    response.end();
  }
}).listen(8888);

const scopes = [
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-library-modify',
  'user-library-read',
];

// Create the authorization URL
const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state');

// Open the authorisation URL in the default browser
open(authorizeURL);
