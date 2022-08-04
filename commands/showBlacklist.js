const { SlashCommandBuilder, PermissionFlagsBits  } = require("discord.js");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { replit } = require("../config");
const Database = require("@replit/database");
const db = new Database(replit.databaseUrl);
const pages = {};
let isOn = false;

const makePages = async () => {
  const words = await db.get("badWords");
  let count = 0,
    wordCount = 1,
    pageCount = 1,
    text = "",
    embeds = [],
    currentEmbed = new EmbedBuilder();
  for (let word of words) {
    if (count == 0) currentEmbed.setDescription(`${pageCount}`);
    text += `${word} - ${wordCount}\n`;
    count++;
    if (count == 10 || wordCount == words.length) {
      currentEmbed.addFields({ name: "Palavras:", value: `${text}` });
      embeds.push(currentEmbed);
      count = 0;
      text = "";
      pageCount++;
      currentEmbed = new EmbedBuilder();
    }
    wordCount++;
  }
  return embeds;
};

const showWords = async (action) => {
  const embeds = await makePages();
  const id = action.user.id;
  const time = 1000 * 60 * 2;
  const filter = (i) => i.user.id == id;
  const collector = action.channel.createMessageComponentCollector({
    filter,
    time,
  });

  pages[id] = pages[id] || 0;

  const getRow = (id, disabled = false) => {
    const row = new ActionRowBuilder();
    
    row.addComponents(
      new ButtonBuilder()
        .setCustomId("prev_embed")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("⬅️")
        .setDisabled(disabled || pages[id] == 0)
    );

    row.addComponents(
      new ButtonBuilder()
        .setCustomId("next_embed")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("➡️")
        .setDisabled(disabled || pages[id] == embeds.length - 1)
    );

    return row;
  };

  if (isOn) {
    action.reply({
      content: "Você já está rodando uma instância desta operação.",
      ephemeral: true
    })
    throw Error;
  }
  isOn = true;
  action.reply({
    ephemeral: true,
    embeds: [embeds[pages[id]]],
    components: [getRow(id)],
  });

  collector.on("collect", btnInt => {
    if (!btnInt) return;
    btnInt.deferUpdate()
    if (btnInt.customId !== "prev_embed" && btnInt.customId !== "next_embed") return;
    if (btnInt.customId == "prev_embed" && pages[id] > 0) {
        --pages[id];
    }
    else if (btnInt.customId == "next_embed" && pages[id] < embeds.length - 1) {
        ++pages[id];
    }

    action.editReply(
        {
            embeds: [embeds[pages[id]]],
            components: [getRow(id)]
        }
    )
  })

  collector.on("end", () => {
    isOn = false; 
    action.editReply(
    {
        embeds: [new EmbedBuilder().setDescription("A instância foi encerrada.")],
        components: [getRow(0, true)]
    }
    )
  })
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mostrar_blacklist")
    .setDescription("Mostra a lista de palavras blackisted.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const action = await interaction;
    
    if (!action.member.permissions.has("ModerateMembers")) {
      action.reply({
        content:
          "Desculpe, você não tem permissão para ver a lista de palavras.",
        ephemeral: true,
      });
      return;
    }
    try {
      await showWords(action);
    } catch (error) {
      console.log(error);
    }
  },
};
