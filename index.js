import { remove } from "confusables";
import { Client, Intents } from "discord.js";
import Database from "@replit/database";

import badwords from "./badwords.js";
import { discord } from "./config.js";
import { keepAlive } from "./server.js";
import { readCommands } from "./handler.js";

(async () => {
  const { militadas, artes, submundoChat, submundoHumorNegro }
    = discord.channels;
  const intents = [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES];
  const client = new Client({ intents });
  const database = new Database();
  const commands = await readCommands();

  client.once("ready", () => {
    console.log("Bot is ready!");
  });

  client.on("messageCreate", async (message) => {
    if (message.author.bot) {
      return;
    }
    if (message.channelId == militadas.id || message.channelId == artes.id) {
      let rg =
        /(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/;
      if (!message.attachments.firstKey() && !message.content.match(rg)) {
        // Delete after one second.
        const oneSecond = 1000;
        setTimeout(() => message.delete(), oneSecond);
      }
    }

    if (
      message.channelId == submundoChat.id ||
      message.channelId == submundoHumorNegro.id
    ) {
      return;
    }
    let data = await database.get("usersData");
    let user = data["users"][message.author.id];

    if (!user) {
      data["users"][message.author.id] = {
        id: message.author.id,
        name: `${message.author.username}`,
        img: message.author.avatarURL(),
        badwords: {},
      };
      await database.set("usersData", data);
      data = await database.get("usersData");
      user = data["users"][message.author.id];
    }
    let check = message.content;
    for (word of badwords) {
      let rgx = new RegExp("\\b" + remove(word) + "\\b", "ig");
      let bol = remove(check).match(rgx);
      if (bol) {
        message.client.channels.cache
          .find((ch) => ch.id == channelIds.report)
          .send(
            `Atenção! Um usuário disse uma palavra proibida: \n Nome: ${message.author.username} \n Id: ${message.author.id} \n Mensagem: ${message.content} \n Link: ${message.url}`
          );
        if (!user.badwords[word]) {
          data["users"][user["id"]].badwords[word] = 1;
          await database.set("usersData", data);
        } else {
          data["users"][user["id"]].badwords[word]++;
          await database.set("usersData", data);
        }
      }
    }
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
      return;
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      return;
    }

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

  client.login(token);

  keepAlive();
})();
