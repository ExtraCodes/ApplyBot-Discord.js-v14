const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Ping Pong!')
    .setDMPermission(false),
  async execute(interaction, client) {
    await interaction.reply({
      embeds: [
        {
          title: "Ping Pong",
          description: `- **WebSocket Status:** \`${client.ws.status}\`\n- **WebSocket Gateway:** \`${client.ws.gateway}\`\n- **WebSocket Ping:** \`${client.ws.ping}\``
        }
      ]
    });
  },
};