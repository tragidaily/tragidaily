import Database from "@replit/database";
import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { remove } from "confusables";

import badwords from "../badwords.js";
import config from "../../config.js";
import { createSlashCommand }

const database = new Database(config.replit.databaseUrl);

const data = createSlashCommand("./comportamento.json");

async function receive(message) {
  if (message.author.bot) {
    return;
  }

  const { submundoChat, submundoHumorNegro } = config.discord.channels;
  if (
    message.channelId == submundoChat.id ||
    message.channelId == submundoHumorNegro.id
  ) {
    return;
  }
  let data = await database.get("usersData");
  let user = data["users"][message.author.id];

  if (!user) {
    data["users"][message.author.id] = {
      id: message.author.id,
      name: `${message.author.username}`,
      img: message.author.avatarURL(),
      badwords: {},
    };
    await database.set("usersData", data);
    data = await database.get("usersData");
    user = data["users"][message.author.id];
  }
  let check = message.content;
  for (word of badwords) {
    let rgx = new RegExp("\\b" + remove(word) + "\\b", "ig");
    let bol = remove(check).match(rgx);
    if (bol) {
      message.client.channels.cache
        .find((ch) => ch.id == channelIds.report)
        .send(
          `Atenção! Um usuário disse uma palavra proibida: \n Nome: ${message.author.username} \n Id: ${message.author.id} \n Mensagem: ${message.content} \n Link: ${message.url}`
        );
      if (!user.badwords[word]) {
        data["users"][user["id"]].badwords[word] = 1;
        await database.set("usersData", data);
      } else {
        data["users"][user["id"]].badwords[word]++;
        await database.set("usersData", data);
      }
    }
  }
}

async function execute(interaction) {
  const action = await interaction;
  const adm = interaction.member.roles.cache.get("864720804691050496");
  const mod = interaction.member.roles.cache.get("959787387184107580");
  let data = await database.get("usersData");
  let users = data["users"];
  const id = action.options.getString("id");
  const bool = action.options.getBoolean("mostrar");
  if (users[id]) {
    let wordsNumber = Object.values(users[id]["badWords"]);
    if (wordsNumber[0]) {
      wordsNumber = wordsNumber.reduce((i, j) => {
        return i + j;
      }, 0);
    } else {
      wordsNumber = 0;
    }
    let color;
    const embed = new MessageEmbed()
      .setThumbnail(users[id].img)
      .setAuthor(users[id].name)
      .setDescription(
        wordsNumber < 10
          ? (() => {
              color = "#ffffff";
              return "Usuário comportado. Parabéns! :) \n O número de palavras ofensivas ditas é: **Abaixo de 10!**";
            })()
          : wordsNumber < 50
          ? (() => {
              color = "#facc41";
              return "Opa! Percebemos um número um pouco frequente de palavras ofensivas ditas nos canais livres, vamos maneirar!";
            })()
          : (() => {
              color = "#f00000";
              return "Você parecer ter um comportamento um pouco excessivo... Caso haja denúncias, o seu histórico poderá influenciar na sua punição.";
            })()
      );
    embed.setColor(color);
    if ((bool && adm) || (bool && mod)) {
      let list = Object.entries(users[id].badWords),
        words = "";
      if (list[0]) {
        for (item of list) {
          words += item[0] + ": " + item[1] + "\n";
        }
      } else {
        words = "No words!";
      }
      embed.addFields({
        name: "Lista de Palavras:",
        value: words,
      });
      action.reply({ embeds: [embed] });
    } else {
      action.reply({ embeds: [embed] });
    }
  } else {
    action.reply({
      content: "Nenhum usuário com este ID.",
      ephemeral: true,
    });
  }
}

const command = { data, receive, execute };

export default command;
