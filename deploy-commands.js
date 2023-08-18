const { REST, Routes } = require("discord.js");
const { clientId, guildId, token } = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");

const commands = [];

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
      commands.push(command.data.toJSON());
    } else {
      console.log("one of the commands is missing data or execute");
    }
  }
}

const rest = new REST().setToken(token);

deploy = async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
};

deploy();
