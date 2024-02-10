const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uuid: String,
  playerName: String,
  verificationCode: String,
  verified: Boolean,
});

module.exports = User = mongoose.model("Twitch", userSchema, "Twitch");
