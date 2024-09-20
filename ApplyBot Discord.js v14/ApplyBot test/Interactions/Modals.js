const Config = require("../../../Database/Schema/Apply.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require('discord.js');

async function Modals(interaction, client) {
  if (interaction.customId === "question") {
    const question = interaction.fields.getTextInputValue('q');
    let data = await Config.findOne({ guildId: interaction.guild.id });
    const questions = data.questions || [];
    if (!questions) { } else if (questions.length === 5) return interaction.reply({
      content: "You cannot add more than 5 questions.",
      ephemeral: true,
    });
    if (!questions) { } else if (data.questions.map(q => q.name).includes(question)) return interaction.reply({
      content: "You cannot post the same question",
      ephemeral: true,
    });
    questions.push({ name: question });
    data.questions = questions;
    data.save()
    interaction.reply({
      content: "A new question has been added to the list of questions.",
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

    interaction.message.edit({
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
  if (interaction.customId === "submit") {
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
    let ques = data.questions;
    count = ques.length;
    ques = ques.map((q, i) => ({
      name: `#${i + 1} - ${q.name}`,
      value: `\`\`\`\n${interaction.fields.getTextInputValue(q.name)}\`\`\``
    }))
    const channel = interaction.guild.channels.cache.get(data.channel);
    if (!channel) return interaction.reply({
      content: "The submit log channel does not exist or has been deleted.",
      ephemeral: true,
    });
    channel.send({
      content: `Ping: ${interaction.guild.roles.cache.get(data.support)}`,
      embeds: [
        new EmbedBuilder()
          .setTitle('A new submission has arrived.')
          .setDescription(`${interaction.user} has made a new introduction to server management`)
          .addFields(ques)
      ],
      components: [
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel('Accepte')
              .setCustomId('acc-' + interaction.user.id)
              .setStyle('Success')
              .setEmoji('✅'),
            new ButtonBuilder()
              .setLabel('Refuse')
              .setCustomId('ref-' + interaction.user.id)
              .setStyle('Danger')
              .setEmoji('❌'),
            new ButtonBuilder()
              .setCustomId('user-' + interaction.user.id)
              .setStyle('Secondary')
              .setEmoji('👤')
          )
      ]
    })
    interaction.reply({
      content: "Your submission has been sent, please wait.",
      ephemeral: true,
    })
  }
}

module.exports = { Modals }