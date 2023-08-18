const mongoose = require("mongoose");
const validator = require("validator");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  discordId: {
    type: String,
    required: [true, "discord id missing"],
    unique: true,
  },
  role: {
    type: String,
    enum: ["shiftlead", "vollie", "sprout"],
  },
  shift: {
    type: String,
  },
  notifs: {
    type: [String],
  },
  notify: { type: Boolean, default: false },
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    minLength: 10,
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email",
    },
  },
});

// Compile model from schema
const User = mongoose.model("Users", UserSchema);
module.exports = User;
