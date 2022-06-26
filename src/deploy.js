import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

import config from "./config.js";
import { readCommandsJSONs } from "./handler.js";

(async () => {
  try {
    const { token, clientId, guildId } = config;
    const rest = new REST({ version: "9" }).setToken(token);
    const commands = await readCommandsJSONs();

    console.log("Started refreshing application (/) commands.");
    await (guildId
      ? rest.put(Routes.applicationGuildCommands(clientId, guildId), {
          body: commands,
        })
      : rest.put(Routes.applicationCommands(clientId), {
          body: commands,
        }));
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
