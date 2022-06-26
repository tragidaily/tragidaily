import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

import config from "./config.js";
import { readCommandsJSONs } from "./handler.js";

(async () => {
  try {
    const { token, clientId, guildId } = config.discord;
    const rest = new REST({ version: "9" }).setToken(token);
    const commands = await readCommandsJSONs();

    console.log("Started refreshing application (/) commands.");
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
      })
    } else {
      await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      })
    }
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
