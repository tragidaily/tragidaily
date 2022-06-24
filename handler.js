import path from "node:path";
import { readdirSync } from "node:fs";

import { Collection } from "discord.js";

function importModules(paths) {
  // eslint-disable-next-line import/no-dynamic-require
  return Promise.all(paths.map((value) => import(value)));
}

async function readCommands() {
  const directory = path.join(import.meta.url, "commands");

  const filepaths = readdirSync(directory)
    .filter((filename) => filename.endsWith(".js"))
    .map((filename) => path.join(directory, filename));

  const modules = await importModules(filepaths);

  const entries = modules.map((command) => [command.data.name, command]);

  return new Collection(entries);
}

async function readCommandJSONs() {
  const commands = await readCommands();

  const values = commands.values();

  return values.map((command) => command.data.toJSON());
}

export { readCommands, readCommandJSONs };
