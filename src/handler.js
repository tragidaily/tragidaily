import path from "node:path";
import fs from "node:fs";

import { Collection } from "discord.js";

function getCurrentModuleFilename() {
  return new URL(import.meta.url).pathname;
}

function getCurrentModuleDirname() {
  return path.dirname(getCurrentModuleFilename());
}

function getCommandsDirname() {
  return path.join(getCurrentModuleDirname(), "commands");
}

function getCommandsFilenames() {
  const commandsDirname = getCommandsDirname();

  const commandsFilenames = [];

  for (const commandsFilename of fs.readdirSync(commandsDirname)) {
    if (commandsFilename.endsWith(".js")) {
      commandsFilenames.push(path.join(commandsDirname, commandsFilename));
    }
  }

  return commandsFilenames;
}

function importModules(modulesNames) {
  const modules = [];

  for (const moduleName of modulesNames) {
    modules.push(import(moduleName));
  }

  return Promise.all(modules);
}

async function readCommandsModules() {
  const commandsFilenames = getCommandsFilenames();

  const commands = new Collection();

  for (const command of await importModules(commandsFilenames)) {
    commands.set(command.data.name, command);
  }

  return commands;
}

async function readCommandsJSONs() {
  const commands = await readCommandsModules();

  const commandJSONs = [];

  for (const [key, value] of commands) {
    commandJSONs.push(value.data.toJSON());
  }

  return commandJSONs;
}

export { readCommandsModules, readCommandsJSONs };
