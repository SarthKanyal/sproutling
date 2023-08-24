const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserManager,
} = require("discord.js");
const User = require("../db/User.js");
const mailer = require("../mailer/mailer.js");
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

const dayDict = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SUN: "Sunday",
};

const typeDict = {
  CH: "Cafe Helper",
  CP: "Cafe Prep",
  CE: "Community Eats",
};

const timeDict = {
  "9to11": "9 am - 11 am ",
  "11to1": "11 am - 1 pm",
  "1to3": "1 pm - 3 pm",
  "3to5": "3 pm - 5 pm",
  "5to8": "5 pm - 8 pm",
  "11to2": "11 am - 2 pm",
  "2to4": "2 pm - 4 pm",
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

    if (interaction.channel.name === "drop-and-pickup") {
      //getting user who dropped shift:
      const dropId = interaction.customId;
      const dropUser = await User.findOne({ discordId: dropId });

      if (dropUser.pending === false) {
        return await interaction.reply({
          content: "Sorry this shift has already been covered.",
          ephemeral: true,
        });
      }

      //getting user who picked up shift:
      const pickupId = interaction.user.id;
      const pickupUser = await User.findOne({ discordId: pickupId });

      //get shift leads of shift
      const shiftLeads = await User.find({
        shift: dropUser.shift,
        role: "shiftlead",
      });

      shiftLeads.forEach(async (shiftLead) => {
        await mailer.send(
          shiftLead.email,
          `${pickupUser.name} will be covering for ${dropUser.name} during your shift!`,
          "A shift has been covered!"
        );
      });

      //inform dropUser and pickup User

      await mailer.send(
        dropUser.email,
        `${pickupUser.name} will be covering your shift.`,
        "Your shift has been covered!"
      );

      const type = typeDict[dropUser.shift.split("_")[0]];
      const day = dayDict[dropUser.shift.split("_")[1]];
      const time = timeDict[dropUser.shift.split("_")[2]];

      if (pickupUser.notify === "ping") {
        await interaction.client.user.send(
          pickupUser.discordId,
          `Thanks for picking up the shift! Here are the shift details: ${type} on ${day} from ${time}`
        );
      } else {
        await mailer.send(
          pickupUser.email,
          `Thanks for covering this shift for ${dropUser.name}. Shift details: ${type} on ${day} from ${time}`,
          "Thanks for covering!"
        );
      }

      await User.findOneAndUpdate(
        { discordId: dropUser.discordId },
        { pending: false }
      );

      return await interaction.reply({ content: "Covered!" });
    }
    //Enter this branch if user is a vollie or user is a sprout who has selected some shifts
    if (interaction.customId === "notify_ping" && userExists) {
      //Enter this branch if user is a vollie
      if (userExists.role === "vollie") {
        const updatedUser = await User.findOneAndUpdate(
          { discordId: interaction.user.id },
          { notify: "ping" },
          { new: true }
        );
        return await interaction.reply({
          content: "Confirmed your notification requests!",
          ephemeral: true,
        });
        //Enter this branch if user is a sprout
      } else {
        const updatedUser = await User.findOneAndUpdate(
          { discordId: interaction.user.id },
          { role: "sprout", notify: "ping" },
          { new: true }
        );
        const vollieRole = interaction.guild.roles.cache.find(
          (role) => role.name === "sprout"
        );
        interaction.member.roles.add(vollieRole);

        //show name modal to user
        const modal = new ModalBuilder()
          .setCustomId("nameConfirm")
          .setTitle("Name confirmation");
        const nameInput = new TextInputBuilder()
          .setCustomId("confirmName")
          .setLabel("First name / full name ")
          .setStyle(TextInputStyle.Short);

        const firstActionRow = new ActionRowBuilder().addComponents(nameInput);

        // Add inputs to the modal
        modal.addComponents(firstActionRow);
        return await interaction.showModal(modal);
      }
    }
    //Enter this branch if notify by email is clicked and user is a vollie
    if (
      interaction.customId === "notify_confirm" &&
      userExists.role === "vollie"
    ) {
      const existingUser = await User.findOneAndUpdate(
        { discordId: interaction.user.id },
        { notify: "email" },
        { new: true }
      );
      console.log("should have updated here");
      console.log(existingUser);
      await interaction.reply({
        content: "Confirmed your notification requests!",
        ephemeral: true,
      });
      //Enter this branch if a button other than notify confirm is clicked or the user clicking notify confirm is a sprout
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
