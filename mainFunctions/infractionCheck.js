const { remove } = require("confusables");
const { unrestrictedChannels } = require("../config")
const Database = require("@replit/database");
const db = new Database(process.env.REPLIT_DB_URL);


async function infractionCheck(msg) {
    for (let ch of unrestrictedChannels) {
        if (msg.channelId == ch) return false;
    }
  const badWords = await db.get("badWords");
  const words = [];
  let check = msg.content, embed;
  for (word of badWords) {
    let rgx = new RegExp("\\b" + remove(word) + "\\b", "ig");
    let bol = remove(check).match(rgx);
    if (bol) {
      if (!embed) {
        const infraction = {
          color: 0xdb0000,
          title: "Atenção! Um usuário disse uma palavra proibida:",
          description: `${msg.content}`,
          thumbnail: {
            url: msg.author.avatarURL(),
          },
          fields: [
            {
              name: "Message Link:",
              value: `${msg.url}`,
            },
          ],
          timestamp: new Date(),
        };
        embed = infraction;
      }
      words.push(word);
    }
  }
  return {
    embed: embed,
    words: words
  }
}

module.exports = {
    name: "infractionCheck",
    call: infractionCheck
}