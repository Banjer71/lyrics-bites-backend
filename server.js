const express = require("express");
const app = express();
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(cors());

app.get("/api/:artist", async (req, res) => {
  const api_key = process.env.API_KEY;
  const {artist} = req.params
  const api_url = `https://api.musixmatch.com/ws/1.1/track.search?q_artist=${artist}&page_size=4&page=1&f_has_lyrics=1&s_track_rating=desc&apikey=${api_key}`;
  const fetch_results = await fetch(api_url);
  const json = await fetch_results.json();
  const result = json.message.body.track_list;
  console.log(result);
  res.send(result);
});

app.listen("3001", (req, res) => {
  console.log("server started on port 3001");
});
