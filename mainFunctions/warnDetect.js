const Database = require("@replit/database");
const db = new Database(process.env.REPLIT_DB_URL);

async function warnDetect(member, user = false) {
  
  const roleKeys = await db.list("role");
  let toleranceRed = 2,
    red = 0,
    yellow = 0,
    level = 0,
    punish = false,
    toleranceYellow;

  if (user&&!user["warnData"]["punish"]) {
    const warnData = user["warnData"];
    level = warnData.level;
    red = warnData.red;
    yellow = warnData.yellow;
    if (warnData.total >= warnData.red||warnData.total >= warnData.yellow) punish = true;
    else punish = false;
  }
  else if (user&&user["warnData"]["punish"]) {
    level = user["warnData"]["level"];
    level++;
  }

  for (let key of roleKeys) {
    const role = await db.get(key);
    const id = key.split("_")[1];
    
    if (member.roles.cache.get(id) && toleranceRed < role["tolerance"]) {
      toleranceRed = role["tolerance"];
    }
  }

  if (toleranceRed * 2 <= 999) {
    toleranceYellow = toleranceRed * 2;
  } else {
    toleranceYellow = toleranceRed;
  }

  return {
    red: red,
    yellow: yellow,
    totalRed: Math.round(toleranceRed / (1+level)),
    totalYellow: Math.round(toleranceYellow/ (1+level)),
    level: level,
    punish: punish,
  };
}

module.exports = {
  name: "warnDetect",
  call: warnDetect,
};
