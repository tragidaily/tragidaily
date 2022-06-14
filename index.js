import { readdirSync } from "node:fs";
import { remove } from "confusables";
import { Client, Collection, Intents } from "discord.js";
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
const token = process.env["token"];
import Database from "@replit/database";
const db = new Database();
import keepAlive from "./server.js";

client.commands = new Collection();

import badwords from "./badwords.js";

const commandFiles = readdirSync("./commands").filter((file) =>
  file.endsWith(".js")
);

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
}

client.on("ready", async () => {
  console.log("on");
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (
    msg.channelId == "961176960086720532" ||
    msg.channelId == "864730261588803605"
  ) {
    let rg =
      /(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/;
    if (!msg.attachments.firstKey() && !msg.content.match(rg)) {
      setTimeout(() => msg.delete(), 1000);
    }
  }

  if (
    msg.channelId == "961172391529160734" ||
    msg.channelId == "961176833343246348"
  )
    return;
  let data = await db.get("usersData");
  let user = data["users"][msg.author.id];

  if (!user) {
    data["users"][msg.author.id] = {
      id: msg.author.id,
      name: `${msg.author.username}`,
      img: msg.author.avatarURL(),
      badwords: {},
    };
    await db.set("usersData", data);
    data = await db.get("usersData");
    user = data["users"][msg.author.id];
  }
  let check = msg.content;
  for (word of badwords) {
    let rgx = new RegExp("\\b" + remove(word) + "\\b", "ig");
    let bol = remove(check).match(rgx);
    if (bol) {
      msg.client.channels.cache
        .find((ch) => ch.id == "959996003816185908")
        .send(
          `Atenção! Um usuário disse uma palavra proibida: \n Nome: ${msg.author.username} \n Id: ${msg.author.id} \n Mensagem: ${msg.content} \n Link: ${msg.url}`
        );
      if (!user.badwords[word]) {
        data["users"][user["id"]].badwords[word] = 1;
        await db.set("usersData", data);
      } else {
        data["users"][user["id"]].badwords[word]++;
        await db.set("usersData", data);
      }
    }
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
