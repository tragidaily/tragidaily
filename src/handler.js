import path from "node:path";
import fs from "node:fs";

import { Collection } from "discord.js";

import { getCurrentModuleDirname } from "./utils/module.js";

function importModules(modulesNames) {
  const modules = [];

  for (const moduleName of modulesNames) {
    // eslint-disable-next-line import/no-dynamic-require
    modules.push(import(moduleName));
  }

  return Promise.all(modules);
}

function getCommandsDirname() {
  return path.join(getCurrentModuleDirname(import.meta), "commands");
}

async function getCommandsFilenames() {
  const commandsDirname = getCommandsDirname();

  const commandsFilenames = [];

  for (const commandsFilename of await fs.readdir(commandsDirname)) {
    if (commandsFilename.endsWith(".js")) {
      commandsFilenames.push(path.join(commandsDirname, commandsFilename));
    }
  }

  return commandsFilenames;
}

async function getCommandsModules() {
  const commandsFilenames = getCommandsFilenames();

  const commandsModules = new Collection();

  for (const command of await importModules(commandsFilenames)) {
    commandsModules.set(command.data.name, command);
  }

  return commandsModules;
}

async function getCommandsJSONs() {
  const commandsModules = await getCommandsModules();

  const commandsJSONs = new Collection();

  for (const [key, value] of Object.entries(commandsModules)) {
    commandsJSONs.set(key, value.data.toJSON());
  }

  return commandsJSONs;
}

export { getCommandsModules, getCommandsJSONs };
