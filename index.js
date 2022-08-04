const fs = require("node:fs");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds, 
GatewayIntentBits.GuildMessages,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMembers
] });
const { discord } = require("./config")
const Database = require("@replit/database");
const db = new Database();
const badWords = require("./badWords");


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
  await db.set("badWords", badWords);
  await db.set("role_986208551376678922", { tolerance: 999, name: "patrocinador" });
  await db.set("role_921739642313785344", { tolerance: 5, name: "sub" });
  await db.set("role_895635525669646346",  { tolerance: 5, name: "guardião" });
  await db.set("role_872869896223084584", { tolerance: 4, name: "lenda" });
  await db.set("role_872869880892891136", { tolerance: 3, name: "herói" });
  console.log("on");
});

client.on("guildMemberUpdate", async (event) => {
const { warnDetect } = mainFunctions;
const member = await event.fetch();
const user = await db.get(`user_${member.id}`);
if (!user) return;
let warnData = await warnDetect(member, user);
await db.set(`user_${member.id}`, {...user, warnData: warnData});
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  
  const { linkCheck, warnDetect, infractionCheck } = mainFunctions;
  //Only accept links and attachments in the specified channels
  let isMediaChannel = linkCheck(msg);
  if (isMediaChannel) setTimeout(() => msg.delete(), 1000);

  //Add the user to the database
  const adm = msg.member.permissions.has("ModerateMembers");
  const { id } = msg.author;

  const template = {
    badWords: {},
    warnData: {}
  };

  const user = await db.get(`user_${id}`);

  if (!user) {
    await db.set(`user_${id}`, {...template, warnData: await warnDetect(msg.member)});
  } 
   
  if (adm || !user) return;
  
  //Test if the word is a bad word
  const infraction = await infractionCheck(await msg.fetch());

  if (infraction) {
const channel = msg.client.channels.cache.get(discord.channels.reportChannel)
    for (let word of infraction.words) {
      let badWordsAtt = {...user["badWords"]};
      if (!user?.badWords[word]) {
        badWordsAtt[word] = 1;
      } else {
        badWordsAtt[word]++;
      }
      await db.set(`user_${id}`, {...user, badWords: badWordsAtt});
    }
    channel.send({ embeds: [infraction.embed] })
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

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

client.login(discord.token);
