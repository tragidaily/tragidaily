const fs = require("node:fs");
const { Client, Collection, Intents } = require("discord.js");
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
});
const token = process.env["token"];
const Database = require("@replit/database");
const db = new Database();
const badWords = require("./badWords");
const keepAlive = require("./server.js");

const mainFunctions = {};
client.commands = new Collection();

const mainFunctionsFiles = fs
  .readdirSync("./mainFunctions")
  .filter((file) => file.endsWith(".js"));

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of mainFunctionsFiles) {
  const func = require(`./mainFunctions/${file}`);
  mainFunctions[func.name] = func.call;
}

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
}

client.on("ready", async () => {
  await db.set("warnData", [
    { roleId: "986208551376678922", tolerance: 999, name: "patrocinador" },
    { roleId: "921739642313785344", tolerance: 5, name: "sub" },
    { roleId: "895635525669646346", tolerance: 5, name: "guardião" },
    { roleId: "872869896223084584", tolerance: 4, name: "lenda" },
    { roleId: "872869880892891136", tolerance: 3, name: "herói" },
  ]);
  await db.set("badWords", badWords);
  console.log("on");
});

client.on("guildMemberUpdate", async (member) => {
  let data = await db.get("usersData");
  let userWarns = data["users"][member.id]["warns"];

  if (!userWarns) return;

  let warnData = warnDetect(member);
  if (typeof warnData == "object") {
    if (typeof userWarns == "string")
      userWarns = {
        quantity: 0,
        level: 0,
        punish: false,
      };
    warnData.quantity = userWarns.quantity;
    warnData.level = userWarns.level;

    if (warnData.total >= warnData.quantity) warnData.punish = true;
    else warnData.punish = false;
  }
  data["users"][member.id]["warns"] = warnData;
  await db.set("usersData", data);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  const { linkCheck, warnDetect, infractionCheck } = mainFunctions;
  //Only accept links and attachments in the specified channels
  let isMediaChannel = linkCheck(msg);
  if (isMediaChannel) setTimeout(() => msg.delete(), 1000);

  //Add the user to the database
  const adm = msg.member.permissions.has("MODERATE_MEMBERS");
  const { id, username, avatarURL } = msg.author;
  const template = {
    id: id,
    name: `${username}`,
    img: avatarURL(),
    badWords: {},
  };

  let data = await db.get("usersData");
  let user = data["users"][id];

  if (!user) {
    data["users"][id] = template;
  } else if (!user["warns"]) {
    let warnData = warnDetect(msg.member);
    data["users"][id] = {
      ...template,
      warns: warnData,
      badWords: user["badWords"],
    };
  } else {
    data["users"][id] = {
      ...template,
      warns: user["warns"],
      badWords: user["badWords"],
    };
  }
  await db.set("usersData", data);
  data = await db.get("usersData");
  user = data["users"][id];

  if (adm) return;
  //Test if the word is a bad word
  const infraction = infractionCheck(msg);
  if (infraction) {
    const channel = msg.client.channels.cache.find(
      (ch) => ch.id == "959996003816185908"
    );
    for (let word of infraction.words) {
      if (!user.badWords[word]) {
        data["users"][user["id"]].badWords[word] = 1;
      } else {
        data["users"][user["id"]].badWords[word]++;
      }
      await db.set("usersData", data);
    }
    channel.send({ embeds: [infraction.embed] })
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

keepAlive();
client.login(token);
