const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const axios = require("axios");
const cors = require("cors");
const nodemailer = require("nodemailer");
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

app.get("/v.1/api/all", async (req, res) => {
  const allSongs = await Lyrics.find({});
  res.json(allSongs);
});

app.post("/v.1/api/song", async (req, res) => {
  const lyric = req.body;
  const newSong = new Lyrics(lyric);
  await newSong.save();
  res.json(newSong);
});

app.get("/v.1/api/song/:id", async (req, res) => {
  const { id } = req.params;
  const song = await Lyrics.findById(id);
  res.json(song);
});

app.delete("/v.1/api/song/:id", async (req, res) => {
  const { id } = req.params;
  const deleteItem = await Lyrics.findByIdAndDelete(id);
  res.json(deleteItem);
});

app.delete("/v.1/api/all", async (req, res) => {
  const deleteAll = await Lyrics.deleteMany({});
  res.json(deleteAll);
});

app.post("/v.1/api/delete/:ids", (req, res) => {
  const ids = req.body;
  console.log(ids);
  Lyrics.deleteMany(
    {
      _id: {
        $in: ids,
      },
    },
    () => (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.post("/v.1/api/send_email", async (req, res) => {
  const { lyrics, songTitle, artist } = req.body;

  const transporter = nodemailer.createTransport({
    service: process.env.HOST,
    secure: true,
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD,
    },
  });

  let messageOptions = {
    from: process.env.MAIL_FROM,
    to: process.env.USER2,
    subject: "schedule email",
    html: `<div
    style="
    font-family:monospace;
    margin: 0 auto;
    max-width: 400px;
    text-align: center;
    line-height: 2">
    <h2>${songTitle}</h2>
    <h3>by ${artist}</h3>
    ${lyrics}
    </div>`,
  };

  await transporter.sendMail(messageOptions, (error, info) => {
    if (error) {
      throw error;
    } else {
      console.log("Email successfully sent!!!");
      res.json({ status: "lyrics has been sent correctly!!!" });
    }
  });
});

app.listen(PORT, () => console.log(`server running on ${PORT}`));
