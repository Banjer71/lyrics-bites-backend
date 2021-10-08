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
  .then(() => app.listen(PORT, () => console.log(`server running on ${PORT}`)))
  .catch((err) => console.log(err.message));

app.get("/", (req, res) => {
  res.send("hello davide");
});

app.get("/all", async (req, res) => {
  const allSongs = await Lyrics.find({});
  console.log("all the lyrcs: ", allSongs);
  res.json(allSongs);
});

app.post("/api/song", async (req, res) => {
  const lyric = req.body;
  console.log("from the BE: ", lyric);
  const newSong = new Lyrics(lyric);
  await newSong.save();
  console.log("dati salvati: ", newSong);
  res.json(newSong);
});

app.get("/api/song/:id", async (req, res) => {
  const { id } = req.params;
  const song = await Lyrics.findById(id);
  console.log(song);
  res.json(song);
});

app.delete('/api/song/:id', async (req, res) => {
  const { id } = req.params;
  console.log('dataToBeDeleted: ', id)
  await Lyrics.findByIdAndDelete(id)
})

app.delete('/all', async (req, res) => {
  await Lyrics.deleteMany({})
})