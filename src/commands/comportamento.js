import Database from "@replit/database";
import { MessageEmbed } from "discord.js";
import { remove } from "confusables";

import badwords from "../badwords.js";
import { createSlashCommand } from "../builder.js";
import { getRole, getChannel, getChannelId } from "../utils/discord.js";

// TODO: Put this function in ../utils/array.js
function sumArray(array) {
  const sum = (previousValue, currentValue) => previousValue + currentValue;
  return array.reduce(sum);
}

function createMessageEmbed(users, author) {
  // TODO: Filtrar por somente badwords que ocorreram dentro de um mês
  const badwords = users[id].badwords;
  const badwordsValues = Object.values(badwordsValues);
  const badwordsTotal = sumArray(badwords);

  let description;
  let color;

  if (badwordsTotal < 10) {
    color = "#ffffff";
    description = "Usuário comportado. Parabéns! :) \n O número de palavras ofensivas ditas é: **Abaixo de 10!**";
  } else if (badwordsTotal < 50) {
    color = "#facc41";
    description = "Opa! Percebemos um número um pouco frequente de palavras ofensivas ditas nos canais livres, vamos maneirar!";
  } else {
    color = "#f00000";
    description = "Você parecer ter um comportamento um pouco excessivo... Caso haja denúncias, o seu histórico poderá influenciar na sua punição.";
  }

  const messageEmbed = new MessageEmbed()
    .setThumbnail(users[id].image)
    .setAuthor(users[id].name)
    .setDescription(description);

  messageEmbed.setColor(color);

  if ((bool && adm) || (bool && mod)) {
    let list = Object.entries(users[id].badwords), words = "";

    if (list[0]) {
      for (item of list) {
        words += item[0] + ": " + item[1] + "\n";
      }
    } else {
      words = "No words!";
    }
    messageEmbed.addFields({
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

    if (!users[author.id]) {
      users[author.id] = {
        id: author.id,
        name: `${author.username}`,
        image: author.avatarURL(),
        badwords: {},
      };
      await database.set("users", users);
    }


    for (word of badwords) {
      const regex = new RegExp(`\\b${word}\\b`, "i");

      // NOTE: Unobfuscated or ...?
      const contentUnobfuscated = remove(content);

      if (regex.test(contentUnobfuscated)) {
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

        const user = users[author.id];
        users[author.id].badwords[word] = user.badwords[word] ? 1 : user.badwords[word] + 1;

        await database.set("users", users);
      }
    }
  },

  async execute(interaction) {
    const { options } = interaction;
    const administrador = getRole("administrador");
    const moderador = getRole("moderador");
    const users = await database.get("users");
    const userId = options.getUser("id");
    const mostrar = options.getBoolean("mostrar");

    if (users[userId]) {
      const messageEmbed = createMessageEmbed();

      action.reply({ embeds: [messageEmbed] });
    } else {
      action.reply({
        // NOTE: Essa mensagem nao faz sentido
        content: "Nenhum usuario com este ID!",
        ephemeral: true,
      });
    }
  },
};

export default command;
