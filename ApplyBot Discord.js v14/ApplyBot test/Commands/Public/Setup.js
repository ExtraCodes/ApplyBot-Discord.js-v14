const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');

function isColor(color) {
  return /^#[0-9A-F]{6}$/i.test(color);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Set and edit config your bots')
    .setDMPermission(false)
    .addStringOption(option =>
      option
        .setName('content')
        .setDescription('Set content message')
        .setMaxLength(4000)
    )
    .addStringOption(option =>
      option
        .setName('title')
        .setDescription('Set embed title')
        .setMaxLength(256)
    )
    .addStringOption(option =>
      option
        .setName('description')
        .setDescription('Set embed description')
        .setMaxLength(4096)
    )
    .addStringOption(option =>
      option
        .setName('color')
        .setDescription('Set embed color')
        .setMaxLength(7)
    ),
  async execute(interaction, client) {
    const content = interaction.options.getString('content');
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const color = interaction.options.getString('color');
    if (!content && !title && !description) {
      return interaction.reply({
        content: "You must at least choose one of the options and put your own message inside it.",
        ephemeral: true,
      });
    }
    if (color && !title && !description) {
      return interaction.reply({
        content: "You cannot set an embed color without selecting at least one of the embed options.",
        ephemeral: true,
      });
    }
    const embed = new EmbedBuilder() || null;
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (color) embed.setColor(color);
    if (color) {
      if (!isColor(color)) {
        return interaction.reply({
          content: "The color code you entered is wrong. Please type the correct color code",
          ephemeral: true,
        });
      }
    }
    try {
      if (!title && !description) { 
        interaction.reply({
          content: "setup was created and sent successfully",
          ephemeral: true,
        });
        interaction.channel.send({
        content: content,
        components: [
          new ActionRowBuilder()
          .setComponents(
            new ButtonBuilder()
            .setLabel('Apply')
            .setCustomId('apply')
            .setEmoji('📝')
            .setStyle('Secondary')
          )
        ]
      });
        return;
       } 
      interaction.reply({
          content: "setup was created and sent successfully",
          ephemeral: true,
        }) 
      interaction.channel.send({
        content: content,
        embeds: [embed],
        components: [
          new ActionRowBuilder()
          .setComponents(
            new ButtonBuilder()
            .setLabel('Apply')
            .setCustomId('apply')
            .setEmoji('📝')
            .setStyle('Secondary')
          )
        ]
      });
    } catch (err) {
      console.error(err)
      interaction.reply({
        content: `${err.message}`,
        ephemeral: true,
      });
    }
  },
};