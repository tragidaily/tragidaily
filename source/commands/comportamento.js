import Database from "@replit/database";
import { MessageEmbed } from "discord.js";
import * as confusables from "confusables";

import config from "../../config.js";
import { createSlashCommand } from "../builder.js";
import { getRole, getChannel, getChannelId } from "../utilities/discord.js";

// TODO: Reduce database requests through cache
// TODO: This code need to be optimized, the entire database is update
// after every set.
// TODO: Create a class called CachedDatabase
class UserBadwords {
  static database = new Database(config.replit.databaseUrl);

  static hasMessageBadword(message) {
    const { content } = message;
    const contentFiltered = confusables.remove(content);
    const configBadwordFiltered = confusables.remove(configBadword);
    const regex = new RegExp(`\\b${configBadwordFiltered}\\b`, "i");

    return regex.test(contentFiltered);
  }

  constructor(user) {
    this.user = user;
  }

  async get() {
    const databaseUsers = await UserBadwords.database.get("users");

    return databaseUsers[this.user.id].badwords;
  }

  async set(badwords) {
    const data = await this.get();

    if (!data[this.user.id]) {
      data[this.user.id] = { badwords: {} };
    }

    data[this.user.id].badwords = badwords;
    await UserBadwords.database.set("users", data);
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

  async getTotal() {
    const data = await this.get();
    const values = Object.values(data);

    let total = 0;

    for (const value of values) {
      total += value;
    }

    return total;
  }

  async getDescription() {
    const total = await this.getTotal();

    if (total < 10) {
      return `Usuário comportado. Parabéns! :)
O número de palavras ofensivas ditas é: **Abaixo de 10!**`;
    } else if (total < 50) {
      return `Opa! Percebemos um número um pouco frequente de palavras ofensivas ditas nos canais livres, vamos maneirar!
O número de palavras ofensivas ditas é: **Abaixo de 50!**`;
    } else {
      return `Você parecer ter um comportamento um pouco excessivo...
Caso haja denúncias, o seu histórico poderá influenciar na sua punição.
O número de palavras ofensivas ditas é: **Acima de 50!**`;
    }
  }

  async getColor() {
    const total = await this.getTotal();
    const { colors } = config.discord;

    if (total < 10) {
      return colors.branco;
    } else if (total < 50) {
      return colors.amarelo;
    } else {
      return colors.vermelho;
    }
  }

  async incrementCounter(badword) {
    const data = await this.get();
    data[badword] = data[badword] ? 1 : data[badword] + 1;
    this.set(data);
  }
}

function createMessageEmbed(member, options, databaseUser, mostrar) {
  const usuario = options.getUser("usuario");
  const mostrar = options.getBoolean("mostrar");

  usuario.badwords = new UserBadwords(usuario);

  const messageEmbed = new MessageEmbed()
    .setAuthor(usuario.username)
    .setThumbnail(usuario.avatar)
    .setDescription(usuario.badwords.getDescription())
    .setColor(usuario.badwords.getColor());

  if (mostrar) {
    const administrador = getRole(member, "administrador");
    const moderador = getRole(member, "moderador");

    if (administrador || moderador) {
      const userBadwordsString = user.badwords.toString();

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
    const { channelId, author, client } = message;

    if (
      channelId === getChannelId("submundoChat") ||
      channelId === getChannelId("submundoHumorNegro")
    ) {
      return;
    }

    if (author.bot) {
      return;
    }

    author.badwords = new UserBadwords(author);

    const databaseUsers = await database.get("users");

    if (!databaseUsers[author.id]) {
      users[author.id] = { badwords: {} };
      await database.set("users", users);
    }

    for (const configBadword of configBadwords) {
      if (UserBadwords.hasMessageBadword(message)) {
        author.badwords.incrementCounter(configBadword)
        const channel = getChannel(client, "report");

        channel.send(
          `Atenção! Um usuário disse uma palavra proibida:

Nome: ${author.username}
Id: ${author.id}
Mensagem: ${message.content}
Link: ${message.url}`
        );
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
