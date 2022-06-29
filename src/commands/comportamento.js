import Database from "@replit/database";
import { MessageEmbed } from "discord.js";
import * as confusables from "confusables";

import config from "../../config.js";
import { createSlashCommand } from "../builder.js";
import { getRole, getChannel, getChannelId } from "../utils/discord.js";

// TODO: Reduce database requests through cache
// TODO: This code need to be optimized, the entire database is update
// after every set.
class UserBadwords {
  static database = new Database(config.replit.databaseUrl);

  constructor(user) {
    this.user = user;
  }

  async get() {
    const databaseUsers = await UserBadwords.database.get("users");

    return databaseUsers[this.user.id].badwords;
  }

  async set(badwords) {
    const data = await this.get();
    data[this.user.id].badwords = badwords;
    await UserBadwords.database.set("users", data);
  }

  async push(badword) {
    const data = await this.get();
    data[this.user.id].badwords.push(badword);
    await UserBadwords.database.set("users", data);
  }

  async sum() {
    const data = await this.get();
    const values = Object.values(data);

    return values.reduce((a, b) => a + b);
  }

  async toString() {
    const data = await this.get();
    const entries = Object.entries(data);

    let string = "";

    for (const [key, value] of entries) {
      string += `${key}: ${value}\n`;
    }

    return string;
  }
}

function createMessageEmbed(member, options, databaseUser, mostrar) {
  const { colors } = config.discord;
  const usuario = options.getUser("usuario");
  const mostrar = options.getBoolean("mostrar");

  usuario.badwords = new UserBadwords(usuario);

  const userBadwordsTotal = getUserBadwordsTotal(user.badwords);

  let description;
  let color;

  if (userBadwordsTotal < 10) {
    color = colors["branco"];
    description = "Usuário comportado. Parabéns! :) \n O número de palavras ofensivas ditas é: **Abaixo de 10!**";
  } else if (userBadwordsTotal < 50) {
    color = colors["amarelo"];
    description = "Opa! Percebemos um número um pouco frequente de palavras ofensivas ditas nos canais livres, vamos maneirar!";
  } else {
    color = colors["vermelho"];
    description = "Você parecer ter um comportamento um pouco excessivo... Caso haja denúncias, o seu histórico poderá influenciar na sua punição.";
  }

  const messageEmbed = new MessageEmbed()
    .setAuthor(usuario.username)
    .setThumbnail(usuario.avatar)
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

    const databaseUsers = await database.get("users");

    if (!users[author.id]) {
      users[author.id] = {
        id: author.id,
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
            `Atenção! Um usuário disse uma palavra proibida:

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

    try {
      const messageEmbed = createMessageEmbed(member, options);

      action.reply({ embeds: [messageEmbed] });
    } catch (error) {
      if (error.code === "") {
        action.reply({
          content: "Usuario alvo não identificado!",
          ephemeral: true,
        });
      } else {
        throw error;
      }
    }
  },
};

export default command;
