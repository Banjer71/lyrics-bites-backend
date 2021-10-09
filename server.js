const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();
const Lyrics = require("./models/lyrics");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

mongoose
  .connect(`${process.env.DB_CONNECTION_URL}/lyrcsPage`)
  .catch((err) => console.log(err.message));

app.get("/", (req, res) => {
  res.send("hello davide");
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


app.listen(PORT, () => console.log(`server running on ${PORT}`))