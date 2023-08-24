const User = require("../db/User.js");

function getChannelCategory(interaction) {
  const parentId = interaction.channel.parentId;
  return interaction.guild.channels.cache.get(parentId).name;
}

module.exports = {
  name: "isModalSubmit",
  async interactionHandler(interaction) {
    console.log(interaction.customId);
    let discordId = "";
    let name = "";
    let email = "";
    let shift = "";

    if (interaction.customId === "nameConfirm") {
      name = interaction.fields.getTextInputValue("confirmName");
      discordId = interaction.user.id;
      shift = interaction.user?.shiftChoice;
    } else {
      name = interaction.fields.getTextInputValue("confirmNameInput");
      email = interaction.fields.getTextInputValue("confirmEmailInput");
      discordId = interaction.user.id;
      shift = interaction.user?.shiftChoice;
    }

    if (getChannelCategory(interaction) === "vollie-confirm") {
      // await User.create({discordId:String(discordId),role:"vollie",})

      const isShifLead = interaction.member.roles.cache.some(
        (role) => role.name === "shift-lead"
      );

      try {
        await User.create({
          discordId: discordId,
          role: isShifLead ? "shiftlead" : "vollie",
          shift: shift,
          name: name,
          email: email,
        });

        if (!isShifLead) {
          const vollieRole = interaction.guild.roles.cache.find(
            (role) => role.name === "vollie"
          );

          interaction.member.roles.add(vollieRole);
        }
        await interaction.reply({
          content: "Registered!",
          ephemeral: true,
        });
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
        if (existingUser.notify) {
          await User.findOneAndUpdate(
            { discordId: discordId },
            {
              name: name,
            }
          );
        } else {
          await User.findOneAndUpdate(
            { discordId: discordId },
            { role: "sprout", name: name, email: email, notify: "email" },
            { new: true, runValidators: true }
          );
          const vollieRole = interaction.guild.roles.cache.find(
            (role) => role.name === "sprout"
          );
          interaction.member.roles.add(vollieRole);
        }
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
  },
};
