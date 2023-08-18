const { Events } = require("discord.js");
const mongoose = require("mongoose");
const User = require("../db/User.js");

const connectDB = (url) => {
  return mongoose.connect(url);
};

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! logged in as ${client.user.tag}`);
    await connectDB(
      "mongodb+srv://sarthakkanyal:passwordKanyal@cluster0.tgtqiy8.mongodb.net/sproutlings"
    );
    console.log("connected to db");
  },
};
