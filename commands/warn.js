const { SlashCommandBuilder, PermissionFlagsBits  } = require("discord.js");
const {
  EmbedBuilder
} = require("discord.js");
const { replit } = require("../config");
const Database = require("@replit/database");
const db = new Database(replit.databaseUrl);

const warn = async action => {
    const warnType = action.options.getString("categoria");
    const user = action.options.getUser("usuário");
    const reason = action.options.getString("razão");
    const userData = await db.get(`user_${user.id}`);
    const color = {red: "#ed0000", yellow: "#fff200"}
    const members = await action.guild.members.fetch();
    const adm = (await members.get(user.id).fetch()).permissions.has("ModerateMembers");
    if (adm) {
      action.reply({
            content: "**Immortal Object** não pode ser sinalizado.",
            ephemeral: true
        })
      throw Error;
    }
  
    if (user.id == action.user.id) {
       action.reply({
            content: "Você não pode dar warn a si mesmo.",
            ephemeral: true
        })
      throw Error;
    }

    if (!userData) {
        action.reply({
            content: "Usuário não encontrado no banco de dados",
            ephemeral: true
        })
      throw Error;
    }

    const { warnData } = userData;
    let newWarnData = {...warnData, [warnType]: 1+warnData[warnType]}
    
    if (newWarnData[`total${warnType[0].toUpperCase()+warnType.slice(1)}`] <= newWarnData[warnType]) {
        newWarnData["punish"] = true;
      
        action.channel.send({embeds:[new EmbedBuilder().setDescription(`
          O usuário <@${user.id}> atingiu o limite máximo de warns. Por favor, verificar o /comportamento.
        `)]})
    }

    await db.set(`user_${user.id}`, {...userData, warnData: newWarnData})
    action.reply({embeds:[
      new EmbedBuilder()
      .setDescription(`Warn: O usuário <@${user.id}> foi sinalizado :${warnType}_square:.\n ${reason? "**Razão:** " + reason : ""}`)
      .setColor(color[warnType])
    ]})
}

module.exports = {
    data: new SlashCommandBuilder()
      .setName("warn")
      .setDescription("dá um warn ao usuário.")
      .addUserOption(option => 
        option
        .setName("usuário")
        .setDescription("usuário que será punido.")
        .setRequired(true))
      .addStringOption(option => 
        option
        .setName("categoria")
        .setDescription("selecione o tipo de warn")
        .addChoices(
            {name: "light warn", value: "yellow"},
            {name: "heavy warn", value: "red"}
        )
        .setRequired(true))
      .addStringOption(option => 
        option
        .setName("razão")
        .setDescription("razão para o warn")
        )
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
      const action = await interaction;
  
      if (!action.member.permissions.has("ModerateMembers")) {
        action.reply({
          content:
            "Desculpe, você não tem permissão para dar warn.",
          ephemeral: true,
        });
        return;
      }
      try {
        await warn(action);
      } catch (error) {
        console.log(error);
      }
    },
  };
  