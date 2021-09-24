const mongoose = require("mongoose");

const lyricsSchema = new mongoose.Schema(
  {
    lyric: {
      type: String,
      required: true,
    },
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
