import { readFileSync } from "node:fs";

import { SlashCommandBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
// eslint-disable-next-line import/no-namespace
import * as linkify from "linkifyjs";

import config from "../config.js";

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
        });
        break;
    }
  }

  return data;
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

function toUpperCaseFirstCharacter(string) {
  string[0] = string[0].toUpperCase();
  return string;
}

// TODO(cahian): Create an abstraction that allow you to instantiate a
// SlashCommand and a MessageEmbed and set that instance with a json file.
const data = createSlashCommand("./diario.json");

async function receive(message) {
  const { channelId, attachments, content } = message;
  const { militadas, artes } = config.discord.channels;

  if (channelId == militadas.id || channelId == artes.id) {
    if (!attachments.size && !linkify.test(content, "url")) {
      // Delete after one second.
      setTimeout(() => message.delete(), 1000);
    }
  }
}

async function execute(interaction) {
  const { diario, journal } = config.discord.channels;
  const action = await interaction;
  try {
    let url = new URL(action.options.getString("imagem"));
    let autor = "";
    if (action.options.getString("autor")) {
      autor = " - Autor: " + action.options.getString("autor");
    }

    const exampleEmbed = new MessageEmbed()
      .setColor("#b80000")
      .setTitle(action.options.getString("título"))
      .setDescription(action.options.getString("descrição"))
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/844699066930954302/968664576013004861/Tragi.png"
      )
      .setImage(action.options.getString("imagem"))
      .setTimestamp()
      .setFooter({
        text: "Publicado por: " + action.user.username + autor,
        iconURL: action.user.avatarURL(),
      });

    let subtitulo = action.options.getString("subtitulo"),
      subdescrição = action.options.getString("subdescrição");
    let fonte = action.options.getString("fonte"),
      cor = action.options.getString("cor");

    if (fonte) {
      let url2 = new URL(fonte);
      exampleEmbed.setURL(fonte);
    }

    if (cor) {
      let cores = {
        vermelho: "#ed0000",
        laranja: "#ff8000",
        amarelo: "#fff200",
        verde: "#48ff00",
        azul: "#005eff",
        roxo: "#a600ed",
        rosa: "#ff00f7",
        branco: "#ffffff",
        preto: "#000000",
      };
      if (cores[cor]) {
        exampleEmbed.setColor(cores[cor]);
      }
    }

    if (subtitulo) {
      let field = { name: subtitulo, value: "-" };
      if (subdescrição) field["value"] = subdescrição;
      exampleEmbed.addFields(field);
    }

    if (interaction.member.roles.cache.get("968688946043310150")) {
      action.client.channels.cache
        .find((channel) => channel.id == diarioChannelId)
        .send({ embeds: [exampleEmbed] });
      action.reply({
        content: "Sua notícia foi publicada!",
        ephemeral: false,
      });
      action.deleteReply();
    } else {
      action.client.channels.cache
        .find((channel) => channel.id == jornalChannelId)
        .send({ embeds: [exampleEmbed] });
      action.reply({
        content: "Sua notícia foi publicada!",
        ephemeral: false,
      });
      action.deleteReply();
    }
  } catch (error) {
    action.reply({
      content: "URL inválido. Tente novamente!",
      ephemeral: true,
    });
  }
}

const command = { data, receive, execute };

export default command;
