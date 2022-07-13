const { SlashCommandBuilder } = require("@discordjs/builders");
const Database = require("@replit/database");
const db = new Database(process.env.REPLIT_DB_URL);
const warnDetect = require("../mainFunctions/warnDetect");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("AddRoleLimit")
    .setDescription("Adiciona um cargo a lista de warns.")
    .addStringOption((option) =>
      option
        .setName("RoleId")
        .setDescription("Digite o Id do cargo.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("RoleLimit")
        .setDescription("Digite o total de warns.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const action = await interaction;
    const adm = action.member.permissions.has("MODERATE_MEMBERS");

    if (!adm) {
      interaction.reply(
        "Parado aí! Somente membros da staff configurar os warns!"
      );
      return;
    }

    const RoleId = action.options.getString("RoleId");
    const RoleLimit = action.options.getInteger("RoleLimit");

    if (!guild.roles.cache.get(RoleId)) {
      interaction.reply("Cargo inválido!");
    }
    
    let data = await db.get("usersData"), found = false, newData = [];
    for (let role in data) {
        const roleName = action.guild.roles.cache.get(role["roleId"]).name;
        if (role['roleId'] === RoleId) {
            newData.push({ roleId: role["roleId"], tolerance: RoleLimit, name: roleName});
            found = true;
        }
        else {
            newData.push({ roleId: role["roleId"], tolerance: role["tolerance"], name: roleName});
        }
    }

    if (!found) {
        newData.push({ roleId: RoleId, tolerance: RoleLimit, name: action.guild.roles.cache.get(RoleId).name })
    }
    await db.set("warnData", newData);
  },
};
