const { SlashCommandBuilder, PermissionFlagsBits  } = require("discord.js");
const { remove } = require("confusables");
const { replit } = require("../config");
const Database = require("@replit/database");
const db = new Database(replit.databaseUrl);

const addWord = async action => {
  const badWords = await db.get("badWords");
  const newWord = remove(action.options.getString("palavra"));

  for (let word of badWords) {
    if (remove(word) ==  newWord) {
      action.reply(      {
        content: `A palavra ${newWord} já está listada!`,
        ephemeral: true,
      })
      throw Error;
    }
  }

  await db.set("badWords", [...badWords, newWord]);
  action.reply(      {
    content: `A palavra ${newWord} foi adicionada!`,
    ephemeral: true,
  })
}

module.exports = {
    data: new SlashCommandBuilder()
      .setName("blacklist_add")
      .setDescription("Adicione uma palavra a blacklist do server.")
      .addStringOption((option) =>
        option
          .setName("palavra")
          .setDescription("Digite a palavra a ser adicionada.")
          .setRequired(true)
      )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
      const action = await interaction;
      if (!action.member.permissions.has("ModerateMembers")) {
        action.reply({
        content: "Desculpe, você não tem permissão para adicionar palavras.",
        ephemeral: true,
      })
        return;
      }
      try {
        await addWord(action);
      } catch (error) {
        console.log(error)
      }
    },
  };