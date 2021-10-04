import Setlistfm from 'setlistfm-js';
import SpotifyWebApi from 'spotify-web-api-node';
import open from 'open';
import http from 'http';
import url from 'url';
import artists from '../artists.json';
import logger from './services/logger';
import sleep from './services/sleep';
import config, { getMissingConfigVariables } from './config';

const missingConfigVariables = getMissingConfigVariables(config);

if (missingConfigVariables.length > 0) {
  const errorMessage = missingConfigVariables.reduce((acc, cur) => `${acc}- ${cur}\n`, 'The following config variables are missing:\n');
  logger.error(errorMessage);
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
  setlistfmClient = new Setlistfm({
    key: config.setlistFmApiKey,
    format: 'json',
    language: 'en',
  });
} catch (e) {
  logger.error(`An error occurred while connecting to the Setlist.fm API: ${e.message}`);
  process.exit();
}

const generatePlaylists = async (code) => {
  try {
    const token = await spotifyApi.authorizationCodeGrant(code);
    spotifyApi.setAccessToken(token.body.access_token);
    spotifyApi.setRefreshToken(token.body.refresh_token);

    for (const artist of artists) {
      logger.info(`Starting process for ${artist.name}`);
      const setlists = await setlistfmClient.getArtistSetlists(artist.mbid, { p: 1 });
      let lastEventDate;
      let sets;
      let songs = [];
      let counter = 0;

      while (!(songs.length > 9) && counter < setlists.setlist.length) {
        songs = [];
        lastEventDate = setlists.setlist[counter].eventDate;
        sets = setlists.setlist[counter].sets.set;
        sets.forEach((set) => { songs.push(...set.song); });
        counter += 1;
      }

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

// Open the authorization URL in the default browser
open(authorizeURL);
