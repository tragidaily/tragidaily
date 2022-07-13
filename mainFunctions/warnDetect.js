const Database = require("@replit/database");
const db = new Database(process.env.REPLIT_DB_URL);

async function warnDetect (member) {
    const adm = member.permissions.has("MODERATE_MEMBERS");
    const warnData = await db.get("warnData");
    if (adm) return "_Error_ — **Immortal Object** can't get warned";
    let tolerance = 2;
    for (let role of warnData) {
      if (
        member.roles.cache.get(role.roleId) &&
        tolerance < role.tolerance
      ) {
        tolerance = role.tolerance;
      }
    }

    return {
        quantity: 0,
        total: tolerance,
        level: 0,
        punish: false
      };
}

module.exports = {
    name: "warnDetect",
    call:  warnDetect
};