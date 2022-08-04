const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { replit } = require("../config")
const Database = require("@replit/database");
const db = new Database(replit.databaseUrl);

async function createComportamentoEmbed(action) {
  const members = await action.guild.members.fetch()
  const id = action.options.getUser("usuário").id;
  const user = await members.get(id).fetch();
  const getProfile = await user.user.fetch();
  const mostrar = action.options.getBoolean("mostrar");
  const userData = await db.get(`user_${id}`);
  const adm = user.permissions.has("ModerateMembers")

  if (!userData) {
    throw Error;
  }
  
  let color;
  let wordsNumber = Object.values(userData["badWords"]);
  if (wordsNumber[0]) {
    wordsNumber = wordsNumber.reduce((i, j) => {
      return i + j;
    }, 0);
  } else {
    wordsNumber = 0;
  }

  const interactionEmbed = new EmbedBuilder()
    .setTitle(getProfile.tag)
    .setDescription(
      wordsNumber < 10
        ? (() => {
            color = "#ffffff";
            return "Usuário comportado. Parabéns! :) \n O número de palavras ofensivas ditas é: **Abaixo de 10!**";
          })()
        : wordsNumber < 50
        ? (() => {
            color = "#facc41";
            return "Opa! Percebemos um número um pouco frequente de palavras ofensivas ditas nos canais livres, vamos maneirar!";
          })()
        : (() => {
            color = "#f00000";
            return "Você parecer ter um comportamento um pouco excessivo... Caso haja denúncias, o seu histórico poderá influenciar na sua punição.";
          })()
    )
    .setThumbnail(getProfile.avatarURL())
    .setColor(color)

    let fields;
    if(adm){
     fields = { name: "Not warnable user", value: `**Immortal Object**`}
    }
    else if (userData['warnData']['punish']) {
      fields = { name: 'Usuário precisa ser punido', value: "Os níveis de infração deste usuário ultrapassaram o limite permitido. Necessário mute ou ban. \n Ao mutar, o nível de infração subirá e o limite de warns cairá pela metade."}
    }
    else {
      fields = [
        { name: 'Red Flag', value: `${userData["warnData"]["red"]}/${userData["warnData"]["totalRed"]}`, inline: true },
        { name: 'Yellow Flag', value: `${userData["warnData"]["yellow"]}/${userData["warnData"]["totalYellow"]}`, inline: true },
        { name: 'Nível de Infrator', value: `${userData["warnData"]["level"]}`, inline: true }
      ];
    }

    interactionEmbed.setFields(fields);
  
  if (mostrar) {
    if (action.member.permissions.has("ModerateMembers")) {
      let list = Object.entries(userData.badWords),
        words = "";
      if (list[0]) {
        for (item of list) {
          words += item[0] + ": " + item[1] + "\n";
        }
      } else {
        words = "Nenhuma palavra!";
      }

      interactionEmbed.addFields({
        name: "Lista de Palavras:",
        value: words,
      });
    } else {
      interactionEmbed.addFields({
        name: "Lista de Palavras:",
        value: "Você não tem permissão para visualizar.",
      });
    }
  }
  return interactionEmbed
}

const command = {
  data: new SlashCommandBuilder()
    .setName("comportamento")
    .setDescription("Verifique o comportamento de um usuário!")
    .addUserOption((option) =>
      option
        .setName("usuário")
        .setDescription("digite o @usuário")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("mostrar")
        .setDescription("Mostra a lista de palavras proibidas.")
    ),

  async execute(interaction) {
    const action = await interaction;
    try {
      const comportamentoEmbed = await createComportamentoEmbed(action);
      action.reply({ embeds: [comportamentoEmbed] });
    } catch (error) {
      console.log(error);
      action.reply("Usuário não existe no banco de dados.")
    }
  },
};

module.exports = command;
