import { readFileSync } from "node:fs";

import { SlashCommandBuilder } from "@discordjs/builders";

function toUpperCaseFirstCharacter(string) {
  string[0] = string[0].toUpperCase();

  return string;
}

function addSlashCommandOption(data, optionJson) {
  // For example, from "string" to "String".
  const optionType = toUpperCaseFirstCharacter(optionJson["type"]);

  data[`add${optionType}Option`]((optionData) => {
    for (const [key, value] of optionJson) {
      switch (key) {
        case "name":
          optionData.setName(value);
          break;
        case "description":
          optionData.setDescription(value);
          break;
        case "required":
          optionData.setRequired(value);
          break;
      }
    }
  }
}

function createSlashCommand(filepath) {
  const json = JSON.parse(readFileSync(filepath));
  const data = new SlashCommandBuilder();

  for (const [key, value] of json["SlashCommand"]) {
    switch (key) {
      case "name":
        data.setName(value);
        break;
      case "description":
        data.setDescription(value);
        break;
      case "options":
        for (const optionJson of value) {
          addSlashCommandOption(data, optionJson);
        };
        break;
    }
  }

  return data;
}

export { createSlashCommand };
