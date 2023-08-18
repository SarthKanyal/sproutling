const {
  ActionRowBuilder,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserManager,
} = require("discord.js");
const User = require("../db/User.js");
const wait = require("node:timers/promises").setTimeout;
// const Users = require("/home/sarthak/sprouts-bot/events/ready.js").Users;
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
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
      }
    } else if (interaction.isButton()) {
      const buttonCustomId = interaction.customId;
      const dayCode = dayToShift[buttonCustomId.split("_")[0]];
      const timeCode = buttonCustomId.split("_")[1];
      const typeCode = typeToShift[interaction.channel.name];

      //attach shift id to interaction after mapping
      const userExists = User.findOne({ discordId: interaction.user.id });
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
        const secondActionRow = new ActionRowBuilder().addComponents(
          emailInput
        );

        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);
      }
    } else if (interaction.isModalSubmit()) {
      const name = interaction.fields.getTextInputValue("confirmNameInput");
      const email = interaction.fields.getTextInputValue("confirmEmailInput");
      const discordId = interaction.user.id;
      const shift = interaction.user?.shiftChoice;

      if (getChannelCategory(interaction) === "vollie-confirm") {
        // await User.create({discordId:String(discordId),role:"vollie",})
        const vollieRole = interaction.guild.roles.cache.find(
          (role) => role.name === "vollie"
        );

        try {
          await User.create({
            discordId: discordId,
            role: "vollie",
            shift: shift,
            name: name,
            email: email,
          });
          interaction.member.roles.add(vollieRole);
          await interaction.reply({ content: "Registered!", ephemeral: true });
        } catch (err) {
          await interaction.reply({
            content: "invalid email!",
            ephemeral: true,
          });
          console.log(err);
        }
      } else if (getChannelCategory(interaction) === "Notify-me") {
        try {
          //if a user is already a vollie then don't give them sprout role. infact instead of using sprout role to filter for notifications, add another field to database called notifY (boolean) and set it to true if someone fills out the modal in notify-me
          const existingUser = await User.findOne({ discordId: discordId });
          //existing user can only have a role if they have filled the vollie confirm form hence they cannot be assigned the sprout role
          // if (!existingUser.role) {
          //user must be an interested sprout since they don't have vollie role so here we assign them the sprout role and add their email and name
          await User.findOneAndUpdate(
            { discordId: discordId },
            { role: "sprout", name: name, email: email, notify: true },
            { new: true, runValidators: true }
          );
          const vollieRole = interaction.guild.roles.cache.find(
            (role) => role.name === "sprout"
          );
          interaction.member.roles.add(vollieRole);
          // } else {
          //   //user already has a role ie vollie so we only update their notify field here to filter for notifying later
          //   await User.findOneAndUpdate(
          //     { discordId: discordId },
          //     { notify: true }
          //   );
          // }

          await interaction.reply({
            content: "Confirmed your notification requests",
            ephemeral: true,
          });
        } catch (err) {
          console.error(err);
        }
      }
    } else if (interaction.isStringSelectMenu()) {
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
        const newUser = await User.create({
          discordId: discordId,
          notifs: JSON.stringify(shiftReps),
        });
      }

      //inform user that notif shifts have been reigstered
      await interaction.reply({
        content: `Received ${replyDay} shift notification requests, remember to press confirm in notify-me channel!`,
        ephemeral: true,
      });
    }
  },
};
