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
  notify: { type: String, enum: ["email", "ping"] },
  name: {
    type: String,
  },
  email: {
    type: String,
    minLength: 10,
    sparse: true,
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email",
    },
  },
  pending: {
    type: Boolean,
  },
});

// Compile model from schema
const User = mongoose.model("Users", UserSchema);
module.exports = User;
