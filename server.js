const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const jwtDecode = require("jwt-decode");
const nodemailer = require("nodemailer");
require("dotenv").config();
const User = require("./models/user");
const Lyrics = require("./models/lyrics");

const { createToken, hashPassword, verifyPassword } = require("./utils");

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

app.post("/v.1/api/authenticate", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    }).lean();

    if (!user) {
      return res.status(403).json({
        message: "Wrong email or password.",
      });
    }

    const passwordValid = await verifyPassword(password, user.password);

    if (passwordValid) {
      const { password, bio, ...rest } = user;
      const userInfo = Object.assign({}, { ...rest });

      const token = createToken(userInfo);

      const decodedToken = jwtDecode(token);
      const expiresAt = decodedToken.exp;

      res.json({
        message: "Authentication successful!",
        token,
        userInfo,
        expiresAt,
      });
    } else {
      res.status(403).json({
        message: "Wrong email or password.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Something went wrong." });
  }
});

app.post("/v.1/api/signup", async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    console.log(req.body);

    const hashedPassword = await hashPassword(req.body.password);

    const userData = {
      email: email.toLowerCase(),
      firstName,
      lastName,
      password: hashedPassword,
    };

    const existingEmail = await User.findOne({
      email: userData.email,
    }).lean();

    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = new User(userData);
    const savedUser = await newUser.save();

    if (savedUser) {
      const token = createToken(savedUser);
      const decodedToken = jwtDecode(token);
      const expiresAt = decodedToken.exp;

      const { firstName, lastName, email } = savedUser;

      const userInfo = {
        firstName,
        lastName,
        email,
      };

      return res.json({
        message: "User created!",
        token,
        userInfo,
        expiresAt,
      });
    } else {
      return res.status(400).json({
        message: "There was a problem creating your account",
      });
    }
  } catch (err) {
    return res.status(400).json({
      message: "There was a problem creating your account",
    });
  }
});

app.post("/v.1/api/song", async (req, res) => {
  const {
    words,
    trackId,
    songTitle,
    album_id,
    album,
    artistName,
    artistId,
    userEmail,
  } = req.body;
  const userInfo = await User.find({ email: userEmail });
  const userId = userInfo[0]._id;
  const userIdExist = await Lyrics.exists({
    $and: [{ trackId: trackId }, { _user: userId }],
  });

  if (userIdExist) {
    res.json({
      type: "EXIST",
      id: "exist",
      _id: userId,
      message: `${songTitle} already exist in the db`,
    });
  } else {
    const newSong = new Lyrics({
      album_id,
      album,
      trackId,
      artistName,
      artistId,
      songTitle,
      words,
      dataSaved: Date.now(),
      _user: userId,
    });
    console.log(newSong);
    await newSong.save();
    res.json({
      type: "SUCCESS",
      id: "saved",
      _id: userId,
      message: `${songTitle} has been successfully added to the db`,
    });
  }
});

app.get("/v.1/api/all/:email", async (req, res) => {
  const userInfo = await User.find({ email: req.params.email });
  const allSongs = await Lyrics.find({ _user: userInfo });
  res.json(allSongs);
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

app.delete("/v.1/api/all/:email", async (req, res) => {
  const userInfo = await User.find({ email: req.params.email });
  const userId = userInfo[0]._id;
  const deleteAll = await Lyrics.deleteMany({ _user: userId });
  res.json(deleteAll);
});

app.post("/v.1/api/delete", (req, res) => {
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
  res.json("song deleted");
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
