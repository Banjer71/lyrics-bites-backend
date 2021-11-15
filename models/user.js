const moongose = require("mongoose");

const userSchema = new moongose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const User = moongose.model("User", userSchema);
module.exports = User;
