const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const User = require("../db/User.js");
//Maps needed to create shift rep
const dayToShift = {
  monday: "MON",
  tuesday: "TUE",
  wednesday: "WED",
  thursday: "THU",
  friday: "FRI",
  sunday: "SUN",
};

const typeToShift = {
  "cafe-helper": "CH",
  "cafe-prep": "CP",
  "community-eats": "CE",
};
module.exports = {
  name: "isButton",
  async interactionHandler(interaction) {
    const buttonCustomId = interaction.customId;
    const dayCode = dayToShift[buttonCustomId.split("_")[0]];
    const timeCode = buttonCustomId.split("_")[1];
    const typeCode = typeToShift[interaction.channel.name];
    //attach shift id to interaction after mapping
    const userExists = await User.findOne({ discordId: interaction.user.id });
    console.log(userExists);
    if (
      interaction.customId === "notify_confirm" &&
      userExists.role === "vollie"
    ) {
      await User.findOneAndUpdate(
        { discordId: interaction.user.id },
        { notify: true }
      );
      await interaction.reply({
        content: "Confirmed your notification requests!",
        ephemeral: true,
      });
    } else {
      if (interaction.customId !== "notify_confirm") {
        interaction.user.shiftChoice = `${typeCode}_${dayCode}_${timeCode}`;
      }
      const modal = new ModalBuilder()
        .setCustomId("shiftConfirm")
        .setTitle("Confirm your shift!");
      const nameInput = new TextInputBuilder()
        .setCustomId("confirmNameInput")
        .setLabel("First name / full name ")
        .setStyle(TextInputStyle.Short);
      const emailInput = new TextInputBuilder()
        .setCustomId("confirmEmailInput")
        .setLabel("Email")
        .setStyle(TextInputStyle.Short)
        .setMinLength(10)
        .setMaxLength(500);
      const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
      const secondActionRow = new ActionRowBuilder().addComponents(emailInput);
      // Add inputs to the modal
      modal.addComponents(firstActionRow, secondActionRow);
      // Show the modal to the user
      await interaction.showModal(modal);
    }
  },
};
