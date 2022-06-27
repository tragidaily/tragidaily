import { Client, Intents } from "discord.js";

import config from "./config.js";
import { getCommandsModules } from "./src/handler.js";
import { keepAlive } from "./src/server.js";

(async () => {
  const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  });

  client.commands = await getCommandsModules();

  client.once("ready", () => {
    console.log("Bot is ready!");
  });

  client.on("messageCreate", async (message) => {
    try {
      const promises = [];

      for (const command of client.commands) {
        promises.push(command.receive(message));
      }

      await Promise.all(promises);
    } catch (error) {
      console.error(error);
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
        content: "Ocorreu um erro ao executar este comando.",
        ephemeral: true,
      });
    }
  });

  client.login(config.discord.token);

  keepAlive();
})();
