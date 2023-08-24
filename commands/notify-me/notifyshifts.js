const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  SlashCommandBuilder,
  bold,
  underscore,
  channelMention,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

//dicts required
const cafeHelperDict = {
  0: "9 am - 11 am",
  1: "11 am - 1 am",
  2: "1 pm - 3 pm",
  3: "3 pm - 5 pm",
  4: "5 pm - 8 pm",
};
const customIdDict = {
  0: "9to11",
  1: "11to1",
  2: "1to3",
  3: "3to5",
  4: "5to8",
};

function getTargChannelId(interaction, channelName) {
  const currParentId = interaction.channel.parentId;

  for (const channel of interaction.guild.channels.cache) {
    if (
      channel[1]?.parentId === currParentId &&
      channel[1]?.name === channelName
    ) {
      return channel[0];
    }
  }
}

function createDaySelectMenu(day) {
  const daySelectMenu = new StringSelectMenuBuilder()
    .setCustomId(`${day}_shifts`)
    .setPlaceholder("Select shift timings!")
    .setMinValues(1)
    .setMaxValues(4)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(`${cafeHelperDict[0]}`)
        .setValue(`${day}_${customIdDict[0]}`),
      new StringSelectMenuOptionBuilder()
        .setLabel(`${cafeHelperDict[1]}`)
        .setValue(`${day}_${customIdDict[1]}`),
      new StringSelectMenuOptionBuilder()
        .setLabel(`${cafeHelperDict[2]}`)
        .setValue(`${day}_${customIdDict[2]}`),
      new StringSelectMenuOptionBuilder()
        .setLabel(`${cafeHelperDict[3]}`)
        .setValue(`${day}_${customIdDict[3]}`)
    );
  return new ActionRowBuilder().addComponents(daySelectMenu);
}

function createPrepSelectMenu(day) {
  const daySelectMenu = new StringSelectMenuBuilder()
    .setCustomId(`${day}_shifts`)
    .setPlaceholder("Select shift timings!")
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(`${cafeHelperDict[4]}`)
        .setValue(`${day}_${customIdDict[4]}`)
    );
  return new ActionRowBuilder().addComponents(daySelectMenu);
}

function createCESelectMenu() {
  const daySelectMenu = new StringSelectMenuBuilder()
    .setCustomId(`friday_shifts`)
    .setPlaceholder("Select shift timings!")
    .setMinValues(1)
    .setMaxValues(3)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(`9 am - 11 am`)
        .setValue(`friday_9to11`),
      new StringSelectMenuOptionBuilder()
        .setLabel(`11 am - 2 pm`)
        .setValue(`friday_11to2`),
      new StringSelectMenuOptionBuilder()
        .setLabel(`2 pm - 4 pm`)
        .setValue(`friday_2to4`)
    );
  return new ActionRowBuilder().addComponents(daySelectMenu);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vollienotify")
    .setDescription("Accept shift notification choices"),
  async execute(interaction) {
    let mondayRow = createDaySelectMenu("monday");
    let tuesdayRow = createDaySelectMenu("tuesday");
    let wednesdayRow = createDaySelectMenu("wednesday");
    let thursdayRow = createDaySelectMenu("thursday");

    let targChannelId = getTargChannelId(interaction, "cafe-helper");
    let channel = interaction.guild.channels.cache.get(targChannelId);

    await interaction.reply(
      `Use the selection menus to select the shifts that you want to get notified for, and once you have finalized your choices click the confirm button at the bottom of ${bold(
        "THIS"
      )} channel to complete the notification registration process!`
    );

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

    let sundayRow = createPrepSelectMenu("sunday");
    mondayRow = createPrepSelectMenu("monday");
    tuesdayRow = createPrepSelectMenu("tuesday");
    wednesdayRow = createPrepSelectMenu("wednesday");
    thursdayRow = createPrepSelectMenu("thursday");

    targChannelId = getTargChannelId(interaction, "cafe-prep");
    channel = interaction.guild.channels.cache.get(targChannelId);

    await interaction.followUp({
      content: bold(`CAFE PREP SHIFTS: ${channelMention(targChannelId)}`),
    });

    await channel.send({ content: "Sunday shift:", components: [sundayRow] });

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

    targChannelId = getTargChannelId(interaction, "community-eats");
    channel = interaction.guild.channels.cache.get(targChannelId);

    let fridayRow = createCESelectMenu();

    await interaction.followUp({
      content: bold(`COMMUNITY EATS SHIFTS: ${channelMention(targChannelId)}`),
    });

    await channel.send({ content: "Friday shifts:", components: [fridayRow] });

    //confirm button
    const confirmEmailBtn = new ButtonBuilder()
      .setCustomId("notify_confirm")
      .setLabel("Email Confirm")
      .setStyle(ButtonStyle.Primary);
    const confirmPingBtn = new ButtonBuilder()
      .setCustomId("notify_ping")
      .setLabel("Ping Confirm")
      .setStyle(ButtonStyle.Secondary);
    const confirmRow = new ActionRowBuilder().addComponents([
      confirmEmailBtn,
      confirmPingBtn,
    ]);
    await interaction.followUp({
      content:
        "Press confirm email and fill out the form to receive email notifs or press confirm ping to just recieve a discord ping for shift coverage!!",
      components: [confirmRow],
    });
  },
};
