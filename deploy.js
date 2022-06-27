import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

import config from "./config.js";
import { getCommandsJSONs } from "./src/handler.js";

(async () => {
  try {
    const { token, clientId, guildId } = config.discord;
    const rest = new REST({ version: "9" }).setToken(token);
    const commands = await getCommandsJSONs();
    const body = Array.from(commands.values());

    console.log("Started refreshing application (/) commands.");

    // eslint-disable-next-line unicorn/prefer-ternary
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body,
      });
    } else {
      await rest.put(Routes.applicationCommands(clientId), {
        body,
      });
    }

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
