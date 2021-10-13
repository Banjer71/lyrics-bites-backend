const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const axios = require("axios");
const cors = require("cors");
const nodemailer = require('nodemailer');
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
  const deleteItem = await Lyrics.findByIdAndDelete(id);
  res.json(deleteItem)
});

app.delete("/all", async (req, res) => {
  const deleteAll = await Lyrics.deleteMany({});
  res.json(deleteAll)
});

app.get('/send_email/:lyrcs', async (req, res) => {
  const {lyrcs} = req.params
  console.log(lyrcs)
  const transporter = nodemailer.createTransport({
    service: process.env.HOST,
    secure: true,
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD
    }
  });

  let messageOptions = {
    from: process.env.MAIL_FROM,
    to: process.env.USER,
    subject: 'schedule email',
    text: lyrcs
  }
  
  await transporter.sendMail(messageOptions, (error, info) => {
    if (error) {
      throw error
    } else {
      console.log('Email successfully sent!!!')
    }
  });

})





app.listen(PORT, () => console.log(`server running on ${PORT}`));
