import { Client, Intents } from "discord.js";

import { readCommands } from "./handler.js";
import { keepAlive } from "./server.js";
import config from "./config.js";

(async () => {
  const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
  });

  client.commands = await readCommands();

  client.once("ready", () => {
    console.log("Bot is ready!");
  });

  client.on("messageCreate", async (message) => {
    try {
      for (const command of client.commands) {
        command.receive(message);
      }
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
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  });

  client.login(config.discord.token);

  keepAlive();
})();
