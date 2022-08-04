const { remove } = require("confusables");
const { discord, replit } = require("../config")
const { channels } = discord;
const Database = require("@replit/database");
const db = new Database(replit.databaseUrl);


async function infractionCheck(msg) {
    for (let ch of channels.unrestrictedChannels) {
        if (msg.channelId == ch) return false;
    }
  const badWords = await db.get("badWords");

  let check = msg.content, words = [], embed;

  for (let word of badWords) {
    let rgx = new RegExp("\\b" + remove(word) + "\\b", "ig");
    let bol = remove(check).match(rgx);
    if (bol) {
      if (!embed) {
        const infraction = {
          color: 0xdb0000,
          title: `Atenção! O usuário ${msg.author.tag} disse uma palavra proibida:`,
          description: `${msg.content}`,
          thumbnail: {
            url: msg.author.avatarURL(),
          },
          fields: [
            {
              name: "Link da Mensagem:",
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
  
if (!embed) return false;
  
  return {
    embed: embed,
    words: words
  }
}

module.exports = {
    name: "infractionCheck",
    call: infractionCheck
}