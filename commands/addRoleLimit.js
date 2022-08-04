const { SlashCommandBuilder, PermissionFlagsBits  } = require("discord.js");
const { replit } = require("../config");
const Database = require("@replit/database");
const db = new Database(replit.databaseUrl);
const warnDetect = require("../mainFunctions/warnDetect");

const userHasPermissions = (action) => {
  const adm = action.member.permissions.has("ModerateMembers");
  if (!adm) {
    action.reply("Parado aí! Somente membros da staff configurar os warns!");
    throw Error;
  }
  return;
};

const setRole = async (action) => {
  const role = action.options.getRole("role");
  const roleLimit = action.options.getInteger("limite");

  let roleExist = await db.get(`role_${role.id}`),
    message;

  if (!roleExist) {
    message = `O cargo de nome ${role.name}, receberá as tolerâncias de ${roleLimit} para red flag e ${
      roleLimit * 2
    } para yellow flag.`;
  } else {
    message = `Cargo de nome ${role.name} já existe. Seu limete será atualizado de ${roleExist["tolerance"]} para ${roleLimit}.`;
  }
  action.reply({
    content: message,
    ephemeral: true,
  });
  await db.set(`role_${role.id}`, { tolerance: roleLimit, name: role.name });
};

const setMembersNewRoles = async action => {
  const roleId = action.options.getRole("role").id;
  const roles = await action.guild.roles.fetch();
  const roleMembers = roles.get(roleId).members;

  if (roleMembers) {
    for await (let member of roleMembers) {
      const memberId = `user_${member[0]}`;
      const memberData = await db.get(memberId);
      if (!memberData) continue;
      const toleranceAtt = await warnDetect.call(member[1], memberData);
      await db.set(memberId, { ...memberData, warnData: toleranceAtt });
    }
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warns_limite")
    .setDescription("Adiciona um cargo a lista de warns.")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Digite o @ do cargo.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("limite")
        .setDescription("Digite o total de warns.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const action = await interaction;
    try {
      userHasPermissions(action);
      await setRole(action);
      await setMembersNewRoles(action);
    } catch (error) {
      console.log(error);
    }
  },
};
