import { join as joinPath } from "node:path";
import { readdir as readDirectory } from "node:fs";

import { Collection } from "discord.js";

function importModules(paths) {
  const modules = [];

  for (const path of paths) {
    modules.push(import(path));
  }

  return Promise.all(modules);
}

async function readCommands() {
  const directory = joinPath(import.meta.url, "commands");

  const filepaths = [];

  for (const filename of await readDirectory(directory)) {
    if (filename.endsWith(".js")) {
      filepaths.push(joinPath(directory, filename))
    }
  }

  const commands = new Collection();

  for (const command of await importModules(filepaths)) {
    commands.set(command.data.name, command);
  }

  return commands;
}

async function readCommandJSONs() {
  const commands = await readCommands();

  const commandJSONs = [];

  for (const [key, value] of commands) {
    commandJSONs.push(value.data.toJSON());
  }

  return commandJSONs;
}

export { readCommands, readCommandJSONs };
