import Database from "@replit/database";
import { MessageEmbed } from "discord.js";
import { remove } from "confusables";

import badwords from "../badwords.js";
import { createSlashCommand } from "../builder.js";
import { getChannel, getChannelId } from "../utils/discord.js";

function createMessageEmbed() {
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
  }
}

const database = new Database(config.replit.databaseUrl);

const command = {
  data: createSlashCommand("./comportamento.json"),

  async receive(message) {
    // TODO: Update the database structure. Rename the key "usersData" to
    // "users" and change the value of "usersData" from { "users": { ... } } to
    // { ... }.

    const { submundoChat, submundoHumorNegro } = config.discord.channels;
    const { channelId, author, content, client } = message;

    if (
      channelId === getChannelId("submundoChat") ||
      channelId === getChannelId("submundoHumorNegro")
    ) {
      return;
    }

    if (author.bot) {
      return;
    }

    const users = await database.get("users");

    if (!data[author.id]) {
      data[author.id] = {
        id: author.id,
        name: `${author.username}`,
        image: author.avatarURL(),
        badwords: {},
      };
      await database.set("users", data);
    }

    for (word of badwords) {
      let regex = new RegExp("\\b" + remove(word) + "\\b", "ig");
      if (remove(content).match(regex)) {
        const channel = getChannel("report");

        channel.send(
            `
Atencao! Um usuário disse uma palavra proibida:

Nome: ${author.username}
Id: ${author.id}
Mensagem: ${message.content}
Link: ${message.url}
`
          );

        if (!user.badwords[word]) {
          data["users"][user["id"]].badwords[word] = 1;
        } else {
          data["users"][user["id"]].badwords[word] += 1;
        }
        await database.set("usersData", data);
      }
    }
  },

  async execute(interaction) {
    const action = await interaction;
    const adm = interaction.member.roles.cache.get("864720804691050496");
    const mod = interaction.member.roles.cache.get("959787387184107580");
    let data = await database.get("usersData");
    let users = data["users"];
    const id = action.options.getString("id");
    const bool = action.options.getBoolean("mostrar");
    if (users[id]) {


      action.reply({ embeds: [embed] });
    } else {
      action.reply({
        content: "Nenhum usuário com este ID.",
        ephemeral: true,
      });
    }
  },
};

export default command;
