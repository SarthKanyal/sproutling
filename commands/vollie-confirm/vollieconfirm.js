const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  bold,
  underscore,
  channelMention,
} = require("discord.js");

const cafeHelperDict = {
  0: "9 am - 11 am",
  1: "11 am - 1 am",
  2: "1 pm - 3 pm",
  3: "3 pm - 5 pm",
};
const customIdDict = { 0: "9to11", 1: "11to1", 2: "1to3", 3: "3to5" };

function createDayRow(day) {
  dayButtons = [];

  for (const index of Object.keys(cafeHelperDict)) {
    const btn = new ButtonBuilder()
      .setCustomId(`${day}_${customIdDict[index]}`)
      .setLabel(`${cafeHelperDict[index]}`)
      .setStyle(ButtonStyle.Secondary);

    dayButtons.push(btn);
  }

  return new ActionRowBuilder().addComponents(dayButtons);
}

function createPrepRow(day) {
  const btn = new ButtonBuilder()
    .setCustomId(`${day}_5to8`)
    .setLabel("5 pm - 8 pm")
    .setStyle(ButtonStyle.Secondary);
  return new ActionRowBuilder().addComponents(btn);
}

function createCommunityEatsRow() {
  const first = new ButtonBuilder()
    .setCustomId("friday_9to11")
    .setLabel("9 am - 11 am")
    .setStyle(ButtonStyle.Secondary);

  const second = new ButtonBuilder()
    .setCustomId("friday_11to2")
    .setLabel("11 am - 2 pm")
    .setStyle(ButtonStyle.Secondary);

  const third = new ButtonBuilder()
    .setCustomId("friday_2to4")
    .setLabel("2 pm - 4 pm")
    .setStyle(ButtonStyle.Secondary);

  return new ActionRowBuilder().addComponents([first, second, third]);
}

function getTargChannelId(interaction, channelName) {
  for (const channel of interaction.guild.channels.cache) {
    if (interaction.guild.channels.cache.get(channel[0]).name === channelName) {
      return channel[0];
    }
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vollieconfirm")
    .setDescription("Sends the permanent vollie shift confirm menu"),
  async execute(interaction) {
    // CAFE-HELPER SHIFTS
    let mondayRow = createDayRow("monday");
    let tuesdayRow = createDayRow("tuesday");
    let wednesdayRow = createDayRow("wednesday");
    let thursdayRow = createDayRow("thursday");

    let targChannelId = getTargChannelId(interaction, "cafe-helper");
    let channel = interaction.guild.channels.cache.get(targChannelId);

    await interaction.reply({
      content:
        "Please select the shift that you have been assigned to and complete the confirmation process by entering your name and email!",
    });

    await interaction.followUp({
      content: bold(`CAFE HELPER SHIFTS: ${channelMention(targChannelId)}`),
    });

    await channel.send({
      content: "Monday shifts:",
      components: [mondayRow],
    });

    await channel.send({
      content: "Tuesday shifts:",
      components: [tuesdayRow],
    });
    await channel.send({
      content: "Wednesday shifts:",
      components: [wednesdayRow],
    });
    await channel.send({
      content: "Thursday shifts:",
      components: [thursdayRow],
    });

    //CAFE-PREP SHIFTS
    let sundayRow = createPrepRow("sunday");
    mondayRow = createPrepRow("monday");
    tuesdayRow = createPrepRow("tuesday");
    wednesdayRow = createPrepRow("wednesday");
    thursdayRow = createPrepRow("thursday");

    targChannelId = getTargChannelId(interaction, "cafe-prep");
    channel = interaction.guild.channels.cache.get(targChannelId);

    await interaction.followUp({
      content: bold(`CAFE PREP SHIFTS: ${channelMention(targChannelId)}`),
    });

    await channel.send({
      content: "Sunday shift:",
      components: [sundayRow],
    });

    await channel.send({
      content: "Monday shift:",
      components: [mondayRow],
    });

    await channel.send({
      content: "Tuesday shift:",
      components: [tuesdayRow],
    });
    await channel.send({
      content: "Wednesday shift:",
      components: [wednesdayRow],
    });
    await channel.send({
      content: "Thursday shift:",
      components: [thursdayRow],
    });

    //COMMUNITY-EATS SHIFTS
    let fridayRow = createCommunityEatsRow();
    targChannelId = getTargChannelId(interaction, "community-eats");
    channel = interaction.guild.channels.cache.get(targChannelId);

    await interaction.followUp({
      content: bold(`COMMUNITY EATS SHIFTS: ${channelMention(targChannelId)}`),
    });

    await channel.send({
      content: "Friday Shifts:",
      components: [fridayRow],
    });
  },
};
