const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const Config = require("../Database/Schema/Apply.js");

async function Buttons(interaction, client) {
  if (interaction.customId === "apply") {
    const data = await Config.findOne({ guildId: interaction.guild.id });
    if (!data) return interaction.reply({
      content: "- **You need to set:**\n`/set questions`",
      ephemeral: true,
    })
    if (!data.questions) return interaction.reply({
      content: "- **You need to set:**\n`/set questions`",
      ephemeral: true,
    })
    if (!data.support) return interaction.reply({
      content: "- **You need to set:**\n`/set support`",
      ephemeral: true,
    })
    if (!data.accepte) return interaction.reply({
      content: "- **You need to set:**\n`/set accepte`",
      ephemeral: true,
    })
    if (!data.channel) return interaction.reply({
      content: "- **You need to set:**\n`/set channel`",
      ephemeral: true,
    })
    const questions = data.questions;
    modal = new ModalBuilder()
      .setCustomId('submit')
      .setTitle('Apply To Support Team ' + interaction.guild.name);

    questions.forEach((i) => {
      const input = new ActionRowBuilder()
        .setComponents(
          new TextInputBuilder()
            .setCustomId(i.name)
            .setLabel(i.name)
            .setStyle("Short")
            .setRequired(true)
        )

      modal.addComponents(input);
    })

    await interaction.showModal(modal);
  }
  if (interaction.customId === "add") {
    modal = new ModalBuilder()
      .setCustomId('question')
      .setTitle('Add new question');

    const input = new ActionRowBuilder()
      .setComponents(
        new TextInputBuilder()
          .setCustomId('q')
          .setLabel('Type your question:')
          .setStyle("Short")
          .setMaxLength(40)
          .setRequired(true)
      )

    modal.addComponents(input);

    await interaction.showModal(modal);
  }
  if (interaction.customId === "remove") {
    const data = await Config.findOne({ guildId: interaction.guild.id });
    const questions = data.questions;
    if (!questions || questions.length <= 0) return interaction.reply({
      content: "There are no questions to delete",
      ephemeral: true,
    });
    interaction.reply({
      content: "**Select the question you want to delete.**",
      components: [
        new ActionRowBuilder()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('remv')
              .setPlaceholder('Select questions to delete')
              .setMinValues(1)
              .setMaxValues(questions.length)
              .addOptions(
                questions.map((q) => ({
                  label: q.name,
                  value: q.name,
                  description: "Click here to remove this question from the list",
                  emoji: "🗑️"
                }))
              )
          )
      ],
      ephemeral: true,
    })
    const Cfilter = i => i.user.id === interaction.user.id;
    const collecte = interaction.channel.createMessageComponentCollector({ filter: Cfilter, componentType: ComponentType.StringSelect, time: 120_000 })
    collecte.on("collect", async (i) => {
      if (i.customId === "remv") {
        const selectedValues = i.values;
        const newData = data.questions.filter((question) => {
          return !selectedValues.includes(question.name);
        });
        data.questions = newData;
        data.save()
        i.update({
          content: "The questions you selected have been removed from the SelectMenu.",
          components: [],
          ephemeral: true,
        })
        let info = await Config.findOne({ guildId: interaction.guild.id });
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
          ques = ques.map((q, i) => `- Question \`#${i + 1}\`\n\`\`\`${q.name}\`\`\``).join('\n');
        }

        await interaction.message.edit({
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
      }
    })
  }
  if (interaction.customId.startsWith('user-')) {
    const id = interaction.customId.substring(5);
    if (interaction.guild.members.cache.get(id)) {
      const user = client.users.cache.get(id);
      interaction.reply({
        content: `[${user.username}](https://discord.com/users/${user.id}) ${user}`,
        embeds: [
          new EmbedBuilder()
            .setTitle(`${user.tag}`)
            .addFields({
              name: "Joined discord:",
              value: `<t:${parseInt(user.createdAt.getTime() / 1000)}:R>`
            })
            .setThumbnail(user.avatarURL({ dynamic: true }))
        ],
        ephemeral: true,
      })
    } else {
      interaction.reply({
        content: "This user is leave the server",
        ephemeral: true,
      })
    }
  }
  if (interaction.customId.startsWith('acc-')) {
    const data = await Config.findOne({ guildId: interaction.guild.id });
    if (!interaction.member.permissions.has('Administrator')) {
      if (!interaction.member.roles.cache.has(data.support)) {
        return interaction.reply({
          content: "You are not part of the staff",
          ephemeral: true,
        });
      }
    }
    const id = interaction.customId.substring(4);
    if (interaction.guild.members.cache.get(id)) {
      const user = client.users.cache.get(id);
      const member = interaction.guild.members.cache.get(id);
      try {
        await member.roles.add(data.accepte);
        interaction.reply({
          content: "This member has been accepted",
          ephemeral: true,
        })
        interaction.message.edit({
          components: [
            new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setLabel(user.username + ' has ben accepted')
                  .setStyle('Secondary')
                  .setEmoji('✅')
                  .setCustomId('0000')
                  .setDisabled(true)
              )
          ]
        })
        try {
          user.send(`🥳 ${user} **you are accepted by ${interaction.user}.**`);
        } catch (err) { }
      } catch (error) {
        if (error.message === "Missing Permissions") {
          interaction.reply({
            content: "My role does not allow me to accept this thing. My role must be higher than the chosen role and the role of the member",
            ephemeral: true,
          })
        }
      }
    } else {
      interaction.reply({
        content: "This user is leave the server",
        ephemeral: true,
      })
    }
  }
  if (interaction.customId.startsWith('ref-')) {
    const data = await Config.findOne({ guildId: interaction.guild.id });
    if (!interaction.member.permissions.has('Administrator')) {
      if (!interaction.member.roles.cache.has(data.support)) {
        return interaction.reply({
          content: "You are not part of the staff",
          ephemeral: true,
        });
      }
    }
    const id = interaction.customId.substring(4);
    if (interaction.guild.members.cache.get(id)) {
      const user = client.users.cache.get(id);
      try {
        interaction.reply({
          content: "This member has been refused",
          ephemeral: true,
        })
        interaction.message.edit({
          components: [
            new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setLabel(user.username + ' has ben refused')
                  .setStyle('Secondary')
                  .setEmoji('❌')
                  .setCustomId('0000')
                  .setDisabled(true)
              )
          ]
        })
        try {
          user.send(`😕 ${user} **you are refused by ${interaction.user}.**`);
        } catch (err) { }
      } catch (error) {
        if (error.message === "Missing Permissions") {
          interaction.reply({
            content: "My role does not allow me to accept this thing. My role must be higher than the chosen role and the role of the member",
            ephemeral: true,
          })
        }
      }
    } else {
      interaction.reply({
        content: "This user is leave the server",
        ephemeral: true,
      })
    }
  }
}

module.exports = { Buttons }