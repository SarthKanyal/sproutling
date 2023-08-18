const fs = require("node:fs");
const path = require("node:path");
const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const { token } = require("./config.json");
const Sequelize = require("sequelize");
const mongoose = require("mongoose");
const User = require("./db/User.js");
//creating a new client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

//reading commands from commands dir and adding to client(bot)
client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandsFolders = fs.readdirSync(foldersPath);

for (const folder of commandsFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandsFile = fs.readdirSync(commandsPath, (file) =>
    file.endsWith(".js")
  );
  for (const file of commandsFile) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log("one of the commands is missing data or execute");
    }
  }
}

//register event handlers
const eventsPath = path.join(__dirname, "events");
const eventsFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventsFiles) {
  const eventPath = path.join(eventsPath, file);
  const event = require(eventPath);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

//once client is ready, login with token

console.log("Attempting to login with token");
client.login(token);

// const Schema = mongoose.Schema;

// const UserSchema = new Schema({
//   name: String,
//   id: String,
// });

// // Compile model from schema
// const User = mongoose.model("Users", UserSchema);
