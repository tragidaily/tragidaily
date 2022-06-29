import Database from "@replit/database";
import { MessageEmbed } from "discord.js";
import * as confusables from "confusables";

import config from "../../config.js";
import { createSlashCommand } from "../builder.js";
import { getRole, getChannel, getChannelId } from "../utils/discord.js";

function getUserBadwordsTotal(userBadwords) {
  let badwordsTotal = 0;

  for (const badwordValue of Object.values(badwords)) {
    badwordsTotal += badwordValue;
  }

  return badwordsTotal;
}

function getUserBadwordsString(userBadwords) {
  let badwordsString = "";

  for (const [key, value] of Object.entries(badwords)) {
    words += key + ": " + value + "\n";
  }

  return badwordsString;
}

function createMessageEmbed(user, mostrar) {
  const userBadwordsTotal = getUserBadwordsTotal(user.badwords);

  let description;
  let color;

  if (userBadwordsTotal < 10) {
    color = "#ffffff";
    description = "Usuário comportado. Parabéns! :) \n O número de palavras ofensivas ditas é: **Abaixo de 10!**";
  } else if (userBadwordsTotal < 50) {
    color = "#facc41";
    description = "Opa! Percebemos um número um pouco frequente de palavras ofensivas ditas nos canais livres, vamos maneirar!";
  } else {
    color = "#f00000";
    description = "Você parecer ter um comportamento um pouco excessivo... Caso haja denúncias, o seu histórico poderá influenciar na sua punição.";
  }

  const messageEmbed = new MessageEmbed()
    .setAuthor(user.name)
    .setThumbnail(user.image)
    .setDescription(description)
    .setColor(color);

  if (mostrar) {
    const administrador = getRole(member, "administrador");
    const moderador = getRole(member, "moderador");

    if (administrador || moderador) {
      const userBadwordsString = getUserBadwordsString(user.badwords);

      messageEmbed.addFields({
        name: "Lista de Palavras:",
        value: userBadwordsString || "Não temos palavras!",
      });
    } else {
      messageEmbed.addFields({
        name: "Lista de Palavras:",
        value: "Você não ter permissão para ver a lista de palavras!",
      });
    }
  }
}

const database = new Database(config.replit.databaseUrl);

const command = {
  data: createSlashCommand("./comportamento.json"),

  async receive(message) {
    // TODO: Update the database structure. Rename the key "usersData" to
    // "users" and change the value of "usersData" from { "users": { ... } } to
    // { ... }.

    const configBadwords = config.discord.badwords;
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

    if (!users[author.id]) {
      users[author.id] = {
        id: author.id,
        name: `${author.username}`,
        image: author.avatarURL(),
        badwords: {},
      };
      await database.set("users", users);
    }


    for (const configBadword of configBadwords) {
      const contentFiltered = confusables.remove(content);
      const configBadwordFiltered = confusables.remove(configBadword);
      const regex = new RegExp(`\\b${configBadwordFiltered}\\b`, "i");

      if (regex.test(contentFiltered)) {
        const channel = getChannel(client, "report");

        channel.send(
            `
Atenção! Um usuário disse uma palavra proibida:

Nome: ${author.username}
Id: ${author.id}
Mensagem: ${message.content}
Link: ${message.url}
`
          );

        const user = users[author.id];
        users[author.id].badwords[word] = user.badwords[word] ? 1 : user.badwords[word] + 1;

        await database.set("users", users);
      }
    }
  },

  async execute(interaction) {
    const { member, options } = interaction;
    const users = await database.get("users");
    const userId = options.getUser("id");
    const user = users[userId];
    const mostrar = options.getBoolean("mostrar");

    if (user) {
      const messageEmbed = createMessageEmbed(member, target, mostrar);

      action.reply({ embeds: [messageEmbed] });
    } else {
      action.reply({
        // NOTE: Essa mensagem nao faz sentido
        content: "Nenhum usuário com este ID!",
        ephemeral: true,
      });
    }
  },
};

export default command;
