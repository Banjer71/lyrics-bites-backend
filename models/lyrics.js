const mongoose = require("mongoose");

const lyricsSchema = new mongoose.Schema(
  {
    words: {
      type: String,
      required: true,
    },
    trackId: {
      type: Number,
      required: true,
    },
    album_id: {
      type: Number,
      required: true,
    },
    artistName: {
      type: String,
      required: true,
    },
    artistId: {
      type: Number,
      required: true,
    },
    songTitle: {
      type: String,
      required: true,
    },
    _user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    dataSaved: Date,
  },
  {
    writeConcern: {
      w: "majority",
      j: true,
      wtimeout: 1000,
    },
  }
);

const Lyrics = mongoose.model("Lyrics", lyricsSchema);

module.exports = Lyrics;
