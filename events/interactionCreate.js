const { Events } = require("discord.js");

const chatInputHandler = require("../componentResponses/chatInputResponses.js");
const buttonHandler = require("../componentResponses/buttonResponses.js");
const modalSubmitHandler = require("../componentResponses/modalResponses.js");
const menuSelectHandler = require("../componentResponses/menuSelectResponses.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      await chatInputHandler.interactionHandler(interaction);
    } else if (interaction.isButton()) {
      await buttonHandler.interactionHandler(interaction);
    } else if (interaction.isModalSubmit()) {
      await modalSubmitHandler.interactionHandler(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await menuSelectHandler.interactionHandler(interaction);
    }
  },
};
