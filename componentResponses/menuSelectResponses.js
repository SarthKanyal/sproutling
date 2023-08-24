const {
  ActionRowBuilder,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserManager,
} = require("discord.js");
const User = require("../db/User.js");
function getChannelCategory(interaction) {
  const parentId = interaction.channel.parentId;
  return interaction.guild.channels.cache.get(parentId).name;
}

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
  name: "isStringSelectMenu",
  async interactionHandler(interaction) {
    const discordId = interaction.user.id;
    const shifts = interaction.values;
    const shiftReps = [];
    const replyDay = shifts[0].split("_")[0];
    for (const shift of shifts) {
      const dayCode = dayToShift[shift.split("_")[0]];
      const timeCode = shift.split("_")[1];
      const typeCode = typeToShift[interaction.channel.name];
      const shiftRep = `${typeCode}_${dayCode}_${timeCode}`;
      shiftReps.push(shiftRep);
    }

    const existingUser = await User.findOne({ discordId: discordId });
    //if user exists then they must be a vollie or someone who has selected some notif shifts already
    if (existingUser) {
      //if notifs exist then add them to the current notif shift list
      if (existingUser.notifs.length > 0) {
        const preExistingShifts = JSON.parse(existingUser.notifs);

        for (const preShift of preExistingShifts) {
          if (!shiftReps.includes(preShift)) {
            shiftReps.push(preShift);
          }
        }
      }

      const newUser = await User.findOneAndUpdate(
        { discordId: discordId },
        { notifs: JSON.stringify(shiftReps) },
        { new: true }
      );
      //a non existing user is someone who will be making their first notification shift selection so we create the user here
    } else {
      try {
        const newUser = await User.create({
          discordId: discordId,
          notifs: JSON.stringify(shiftReps),
        });
        console.log(newUser);
      } catch (err) {
        console.error(err);
      }
    }

    //inform user that notif shifts have been reigstered
    await interaction.reply({
      content: `Received ${replyDay} shift notification requests, remember to press one of the confirm buttons in the notify-me channel!`,
      ephemeral: true,
    });
  },
};
