const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('./Database/Connections.js');
const { Client, Events, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, Collection, Partials, InteractionType } = require('discord.js');
  const data = {
    token: "",
    prefix: "r",
    botID: ""
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
  });

  client.token = data.token;
  client.botId = data.botID;

  const publicCommands = [];
  client.publicCommands = new Collection();

  const publicCmd = path.join(__dirname, 'Commands', 'Public');
  const publicFiles = fs.readdirSync(publicCmd).filter(file => file.endsWith('.js'));

  for (const file of publicFiles) {
    const filePath = path.join(publicCmd, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
      client.publicCommands.set(command.data.name, command);
      //console.log(`Loaded public command '${command.data.name}'`);
      publicCommands.push(command.data.toJSON());
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }

  const publicRest = new REST({ version: '10' }).setToken(client.token);

  (async () => {
    try {
      //console.log(`Started refreshing ${publicCommands.length} application (/) commands.`);

      const data = await publicRest.put(
        Routes.applicationCommands(client.botId),
        { body: publicCommands },
      );

     //console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
      console.error(error);
    }
  })();

  client.once(Events.ClientReady, async c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    client.user.setActivity(data.prefix + "help | Apply Bot");
  });

  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const publicCommand = interaction.client.publicCommands.get(interaction.commandName);


    if (!publicCommand) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    if (!interaction.guild.members.me.permissions.has('Administrator')) return interaction.user.send({ content: 'I dont have permissions to use the command' });
    //if (interaction.guild.id === data.guildId) {
      try {
        await publicCommand.execute(interaction, client);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
      }
    /*} else {
      return interaction.reply({
        content: "This bot is for one server only.",
        ephemeral: true
      });
    ;*/
  });

  const { Buttons } = require('./Interactions/Buttons.js');
  const { Modals } = require('./Interactions/Modals.js');

  client.on(Events.InteractionCreate, async (interaction) => {
    //if (interaction.guild.id === data.guildId) {
      if (interaction.isButton()) {
        Buttons(interaction, client);
      }
      if (interaction.isModalSubmit()) {
        Modals(interaction, client);
      }
    //}
  })

  client.login(client.token)
    .catch((err) => { })