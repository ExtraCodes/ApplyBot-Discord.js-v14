const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ChannelType } = require('discord.js');
const Config = require("../../../../Database/Schema/Apply.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName('set')
    .setDescription('Set and edit config your bots')
    .setDMPermission(false)
    .addSubcommand(subcommand =>
      subcommand
        .setName('questions')
        .setDescription('change the bot lang')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('support')
        .setDescription('change the bot lang')
        .addRoleOption(option =>
          option
            .setName('role')
            .setDescription('The channel to echo into')
            .setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('accept')
        .setDescription('change the bot lang')
        .addRoleOption(option =>
          option
            .setName('role')
            .setDescription('The channel to echo into')
            .setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('channel')
        .setDescription('change the bot lang')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('The channel to echo into')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true))
    ),
  async execute(interaction, client) {
    if (interaction.options.getSubcommand() === "questions") {
      if (!interaction.member.permissions.has("Administrator")) return interaction.reply({
        content: "You need `Administrator` permission to use this command.",
        ephemeral: true,
      });
      let info = await Config.findOne({ guildId: interaction.guild.id });
      if (!info) return interaction.reply({
        content: "- **You need to set:**\n`/set support` to set support role\n`/set accepte` to set accepte role\n`/set channel` to set channel log submit",
        ephemeral: true,
      });
      if (!info.support) return interaction.reply({
        content: "You need to register a new role support to use this command.\nnote: user `/set support` to set new support role",
        ephemeral: true,
      });
      if (!info.accepte) return interaction.reply({
        content: "You need to register a new accepte role to use this command.\nnote: user `/set accepte` to set new accepte role",
        ephemeral: true,
      });
      if (!info.channel) return interaction.reply({
        content: "You need to register a new submit log channel to use this command.\nnote: user `/set channel` to set new submit log channel",
        ephemeral: true,
      });
      let support = interaction.guild.roles.cache.get(info.support);
      let accepte = interaction.guild.roles.cache.get(info.accepte);
      let channel = interaction.guild.channels.cache.get(info.channel);
      let ques = info.questions;
      let count = 0;
      if (!support) support = "Undefined Support Role";
      if (!accepte) accepte = "Undefined Accepte Role";
      if (!channel) channel = "Undefined Accepte Channel";
      if (!ques) {
        ques = "- Undefined Apply Questions";
      } else if (ques) {
        count = ques.length;
        ques = ques.map((q, i) =>
          `- Question \`#${i + 1}\`\n\`\`\`${q.name}...\`\`\``).join('\n');
      }
      interaction.reply({
        content: "🔄 **Please wait for the information to load...**"
      })
        .then((m) => {
          setTimeout(() => {
            m.edit({
              content: "",
              embeds: [
                new EmbedBuilder()
                  .setTitle("Apply Config")
                  .setDescription(`- **${support}** \n⚠️ note: use \`/set support\` to save new role support\n\n- **${accepte}** \n⚠️ note: use \`/set accepte\` to save new accepte role\n\n- **${channel}** \n⚠️ note: use \`/set channel\` to set new submit channel `)
                  .addFields({
                    name: `Apply Questions [${count}/5]`,
                    value: `${ques}\n\n⚠️ **note:** \`Click on the button below to add or remove a question.\``
                  })
              ],
              components: [
                new ActionRowBuilder()
                  .setComponents(
                    new ButtonBuilder()
                      .setLabel('Add Question')
                      .setCustomId('add')
                      .setEmoji('➕')
                      .setStyle('Success'),
                    new ButtonBuilder()
                      .setLabel('Remove Question')
                      .setCustomId('remove')
                      .setEmoji('➖')
                      .setStyle('Danger')
                  )
              ]
            })
          }, 4000);
        });
    }
    if (interaction.options.getSubcommand() === "support") {
      if (!interaction.member.permissions.has("Administrator")) return interaction.reply({
        content: "You need `Administrator` permission to use this command.",
        ephemeral: true,
      });
      const role = interaction.options.getRole('role');
      let support = await Config.findOne({ guildId: interaction.guild.id });
      if (!support) {
        await new Config({
          guildId: interaction.guild.id,
          support: role.id,
          accepte: "123",
          channel: "123",
        }).save()
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Register a new role support.')
              .setDescription(`- Registered by: ${interaction.user}`)
              .addFields({
                name: "New Support Role",
                value: `${role} [\`${role.name}\`] (\`${role.id}\`)`
              })
          ]
        })
      } else if (!support.support) {
        support.support = role.id;
        support.save()
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Register a new role support.')
              .setDescription(`- Registered by: ${interaction.user}`)
              .addFields({
                name: "New Support Role",
                value: `${role} [\`${role.name}\`](\`${role.id}\`)`
              })
          ]
        })
      } else {
        let Old = support.support;
        support.support = role.id;
        support.save()
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Register a new role support.')
              .setDescription(`- Registered by: ${interaction.user}`)
              .addFields({
                name: "Old Support Role",
                value: `<@&${Old}>`
              }, {
                name: "New Support Role",
                value: `${role} [\`${role.name}\`](\`${role.id}\`)`
              })
          ]
        })
      }
    }
    if (interaction.options.getSubcommand() === "accept") {
      if (!interaction.member.permissions.has("Administrator")) return interaction.reply({
        content: "You need `Administrator` permission to use this command.",
        ephemeral: true,
      });
      const role = interaction.options.getRole('role');
      let accepte = await Config.findOne({ guildId: interaction.guild.id });
      if (!accepte) {
        await new Config({
          guildId: interaction.guild.id,
          support: "123",
          accepte: role.id,
          channel: "123",
        }).save()
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Register a new accepte role.')
              .setDescription(`- Registered by: ${interaction.user}`)
              .addFields({
                name: "New Accepte Role",
                value: `${role} [\`${role.name}\`] (\`${role.id}\`)`
              })
          ]
        })
      } else if (!accepte.accepte) {
        accepte.accepte = role.id;
        accepte.save()
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Register a new accepte role.')
              .setDescription(`- Registered by: ${interaction.user}`)
              .addFields({
                name: "New Accepte Role",
                value: `${role} [\`${role.name}\`](\`${role.id}\`)`
              })
          ]
        })
      } else {
        let Old = accepte.accepte;
        accepte.accepte = role.id;
        accepte.save()
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Register a new accepte role.')
              .setDescription(`- Registered by: ${interaction.user}`)
              .addFields({
                name: "Old Accepte Role",
                value: `<@&${Old}>`
              }, {
                name: "New Support Role",
                value: `${role} [\`${role.name}\`](\`${role.id}\`)`
              })
          ]
        })
      }
    }
    if (interaction.options.getSubcommand() === "channel") {
      if (!interaction.member.permissions.has("Administrator")) return interaction.reply({
        content: "You need `Administrator` permission to use this command.",
        ephemeral: true,
      });
      const ch = interaction.options.getChannel('channel');
      let channel = await Config.findOne({ guildId: interaction.guild.id });
      if (!channel) {
        await new Config({
          guildId: interaction.guild.id,
          support: "123",
          accepte: "123",
          channel: ch.id,
        }).save()
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Register a new channel submit log.')
              .setDescription(`- Registered by: ${interaction.user}`)
              .addFields({
                name: "New Submit Channel",
                value: `${ch} [\`${ch.name}\`] (\`${ch.id}\`)`
              })
          ]
        })
      } else if (!channel.channel) {
        channel.channel = ch.id;
        channel.save()
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Register a new channel submit log.')
              .setDescription(`- Registered by: ${interaction.user}`)
              .addFields({
                name: "New Submit Channel",
                value: `${ch} [\`${ch.name}\`](\`${ch.id}\`)`
              })
          ]
        })
      } else {
        let Old = channel.channel;
        channel.channel = ch.id;
        channel.save()
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('Register a new channel submit log.')
              .setDescription(`- Registered by: ${interaction.user}`)
              .addFields({
                name: "Old Submit Channel",
                value: `<#${Old}>`
              }, {
                name: "New Submit Channel",
                value: `${ch} [\`${ch.name}\`](\`${ch.id}\`)`
              })
          ]
        })
      }
    }
  },
};