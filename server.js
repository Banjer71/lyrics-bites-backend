const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const Lyrics = require("./models/lyrics");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

mongoose
  .connect(`${process.env.DB_CONNECTION_URL}`)
  .then(console.log("db connected"))
  .catch((err) => console.log(err.message));

app.get("/", (req, res) => {
  res.send("hello Davide");
});

app.get("/api/search/:query/:paramToSearch", async (req, res) => {
  const { query, paramToSearch } = req.params;
  const musicMatch = process.env.REACT_APP_API_KEY_MUSICMATCH;
  const restUrl = `https://api.musixmatch.com/ws/1.1/track.search?${query}=${paramToSearch}&page_size=4&page=3&page_size=6&f_has_lyrics=1&s_track_rating=desc&apikey=${musicMatch}`;

  try {
    const fetchData = await fetch(restUrl);
    const data = await fetchData.json();
    const info = data.message.body.track_list;
    res.send(info);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/covers/:name", async (req, res) => {
  const { name } = req.params;
  let apy_key_lastfm = process.env.REACT_APP_API_KEY_LASTFM;
  const lastfm2 = `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${name}&api_key=${apy_key_lastfm}&format=json`;
  try {
    const response = await fetch(lastfm2);
    const covers = await response.json();
    res.json(covers);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/words/:trackId", async (req, res) => {
  const { trackId } = req.params;
  const urlTrackId = `https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${trackId}&apikey=${process.env.REACT_APP_API_KEY_MUSICMATCH}`;
  try {
    const fetchId = await fetch(urlTrackId);
    const data = await fetchId.json();
    const words = data.message.body.lyrics;
    console.log('words error: ', words)
    res.json(words);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/songtracks/:songTrack", async (req, res) => {
  const { songTrack } = req.params;
  const urlSongTrack = `https://api.musixmatch.com/ws/1.1/track.search?q_track=${songTrack}&apikey=${process.env.REACT_APP_API_KEY_MUSICMATCH}`;

  try {
    const fetchSongTracks = await fetch(`${urlSongTrack}`);
    const data = await fetchSongTracks.json();
    const songName = data.message.body.track_list[0].track.track_name;
    res.json(songName);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/album/:idAlbum", async (req, res) => {
  const { idAlbum } = req.params;
  const urlAlbum = `https://api.musixmatch.com/ws/1.1/album.tracks.get?album_id=${idAlbum}&apikey=${process.env.REACT_APP_API_KEY_MUSICMATCH}`;
  try {
    const fetchAlbumId = await fetch(urlAlbum);
    const data = await fetchAlbumId.json();
    const albumListSong = data.message.body.track_list;
    res.json(albumListSong);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/coverAlbum/:album", async (req, res) => {
  const { album } = req.params;
  const albumInfoUrl = `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${album}&api_key=${process.env.REACT_APP_API_KEY_LASTFM}&format=json`;
  try {
    const fetchAlbumInfo = await fetch(albumInfoUrl);
    const data = await fetchAlbumInfo.json();
    const albumInfo = data.results.albummatches.album[0];
    res.json(albumInfo);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/trackLyrics/:idTrack", async (req, res) => {
  const { idTrack } = req.params;
  const trackLyricsUrl = `https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${idTrack}&apikey=${process.env.REACT_APP_API_KEY_MUSICMATCH}`;
  try {
    const fetchTrackLyrics = await fetch(trackLyricsUrl);
    const data = await fetchTrackLyrics.json();
    const lyric = data.message.body.lyrics;
    res.json(lyric);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/albumTracksGet/:idAlbum", async (req, res) => {
  const { idAlbum } = req.params;
  const albumTracksGetUrl = `https://api.musixmatch.com/ws/1.1/album.tracks.get?album_id=${idAlbum}&apikey=${process.env.REACT_APP_API_KEY_MUSICMATCH}`;
  try {
    const fetchAlbumTracks = await fetch(albumTracksGetUrl);
    const data = await fetchAlbumTracks.json();
    const songName = data.message.body.track_list;
    res.json(songName);
  } catch (error) {
    console.log(error);
  }
});

app.get("/all", async (req, res) => {
  const allSongs = await Lyrics.find({});
  res.json(allSongs);
});

app.post("/api/song", async (req, res) => {
  const lyric = req.body;
  const newSong = new Lyrics(lyric);
  await newSong.save();
  res.json(newSong);
});

app.get("/api/song/:id", async (req, res) => {
  const { id } = req.params;
  const song = await Lyrics.findById(id);
  res.json(song);
});

app.delete("/api/song/:id", async (req, res) => {
  const { id } = req.params;
  await Lyrics.findByIdAndDelete(id);
});

app.delete("/all", async (req, res) => {
  await Lyrics.deleteMany({});
});

app.listen(PORT, () => console.log(`server running on ${PORT}`));
