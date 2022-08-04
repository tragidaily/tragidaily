const { SlashCommandBuilder, PermissionFlagsBits  } = require("discord.js");
const { remove } = require("confusables");
const { replit } = require("../config");
const Database = require("@replit/database");
const db = new Database(replit.databaseUrl);

const removeWord = async action => {
  const badWords = await db.get("badWords");
  const oldWord = remove(action.options.getString("palavra"));
  let found = false;

  for (let word of badWords) {
    if (remove(word) == oldWord) {
      found = true;
      break;
    }
  }

  if (found) {
    let newList = [...badWords].filter(w => remove(w) !== oldWord);
    await db.set("badWords", newList);
    action.reply({
        content: `A palavra ${oldWord} foi removida!`,
        ephemeral: true,
      })
  }
  else {
    action.reply(      {
        content: `A palavra ${oldWord} não foi encontrada!`,
        ephemeral: true,
      })
  }
}

module.exports = {
    data: new SlashCommandBuilder()
      .setName("blacklist_remove")
      .setDescription("Remova uma palavra da blacklist do server.")
      .addStringOption((option) =>
        option
          .setName("palavra")
          .setDescription("Digite a palavra a ser removida.")
          .setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
      const action = await interaction;

      if (!action.member.permissions.has("ModerateMembers")) {
        action.reply({
        content: "Desculpe, você não tem permissão para remover palavras.",
        ephemeral: true,
      })
        return;
      }

      try {
        removeWord(action);
      } catch (error) {
        console.log(error)
      }
    },
  };