const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  bold,
  underscore,
  channelMention,
  userMention,
} = require("discord.js");
const mailer = require("../../mailer/mailer.js");
const User = require("../../db/User.js");

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
  data: new SlashCommandBuilder()
    .setName("dropshift")
    .setDescription(
      "Allows user to offer their shift for pickup and sends email/pings users"
    ),
  async execute(interaction) {
    // get users from db who have notify set. Seperate them into groups of email and ping. Send emails and then send discord dms informing them of shift available for pickup and to use the claim button.
    const dropUser = await User.findOne({ discordId: interaction.user.id });

    const dropShift = dropUser.shift;

    let notiUsers = await User.find({ notify: { $exists: true } });

    notiUsers = notiUsers.filter((notiUser) =>
      JSON.parse(notiUser.notifs).includes(dropShift)
    );
    // console.log(notiUsers);
    //messageLink =
    //https://discord.com/channels/guildId/channelId/1142871666695876680

    const msgLink = `discord://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${interaction.id}`;
    const pingLink = `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${interaction.id}`;

    const type = typeDict[dropShift.split("_")[0]];
    const day = dayDict[dropShift.split("_")[1]];
    const time = timeDict[dropShift.split("_")[2]];

    const btn = new ButtonBuilder()
      .setCustomId(`${interaction.user.id}`)
      .setLabel("Pickup!")
      .setStyle(ButtonStyle.Secondary);
    const confirmRow = new ActionRowBuilder().addComponents(btn);
    await User.findOneAndUpdate(
      { discordId: interaction.user.id },
      { pending: true }
    );

    await interaction.deferReply();

    notiUsers.forEach(async (notiUser) => {
      if (notiUser.notify === "email") {
        await mailer.send(
          notiUser.email,
          `A ${type} shift on ${day} from ${time} is available for pickup! Link to claim button: (You will also recieve a dm from the bot with the same link so use that if this doesn't work!): ${msgLink}`,
          "Shift available for pickup!"
        );
      }

      await interaction.client.users.send(notiUser.discordId, {
        content: `A ${type} shift on ${day} from ${time} is available for pickup! Link to claim button: ${pingLink}`,
      });
    });

    const msg = await interaction.editReply({
      content: `Click here to claim a ${type} shift available on ${day} from ${time}!`,
      components: [confirmRow],
    });
  },
};
