import path from "node:path";
import fs from "node:fs";

import { Collection } from "discord.js";

function getCurrentModuleDirname() {
  return path.dirname(new URL(import.meta.url).pathname);
}

function getCommandsDirname() {
  return path.join(getCurrentModuleDirname(), "commands");
}

async function getCommandsFilenames() {
  const commandsDirname = getCommandsDirname();

  const commandsFilenames = [];

  for (const commandsFilenames of await fs.readdir(commandsDirname)) {
    if (commandsFilenames.endsWith(".js")) {
      commandsFilenames.push(commandsFilenames);
      // commandFilename.push(path.join(commandDirname, commandFilename)); ??!?
    }
  }

  return commandsFilenames;
}

function importModules(modulesFilenames) {
  const modules = [];

  for (const moduleFilename of modulesFilenames) {
    modules.push(import(moduleFilename));
  }

  return Promise.all(modules);
}

async function readCommandsModules() {
  const commandsFilenames = await readCommandsFilenames();

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
