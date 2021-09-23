const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();
const Lyrics = require('./models/lyrics');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

mongoose
  .connect(`${process.env.DB_CONNECTION_URL}/lyrcsPage`)
  .then(() => app.listen(PORT, () => console.log(`server running on ${PORT}`)))
  .catch((err) => console.log(err.message));

app.get('/', (req, res) => {
  res.send('hello davide')
})

app.get("/api/:artist", async (req, res) => {
  const api_key = process.env.API_KEY;
  const { artist } = req.params;
  const api_url = `https://api.musixmatch.com/ws/1.1/track.search?q_artist=${artist}&page_size=4&page=1&f_has_lyrics=1&s_track_rating=desc&apikey=${api_key}`;
  const fetch_results = await fetch(api_url);
  const json = await fetch_results.json();
  const result = json.message.body.track_list;
  console.log(result);
  res.send(result);
});

app.get("/post", (req, res) => {
  res.send("post davide");
});

app.post("/api/song", async (req, res) => {
  const songSelected = req.body
  const lyric = await songSelected.lyric
  console.log(songSelected.lyric)
  res.json(lyric);
});
