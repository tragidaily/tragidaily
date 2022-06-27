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

  const commands = new Collection();

  for (const command of await importModules(commandsFilenames)) {
    commands.set(command.data.name, command);
  }

  return commands;
}

async function getCommandsJSONs() {
  const commands = await getCommandsModules();

  const commandJSONs = [];

  for (const value of commands.values()) {
    commandJSONs.push(value.data.toJSON());
  }

  return commandJSONs;
}

export { getCommandsModules, getCommandsJSONs };
