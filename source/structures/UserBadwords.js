import Database from "@replit/database";
import * as confusables from "confusables";

import config from "../../config.js";

// TODO: Reduce database requests through cache
// TODO: This code need to be optimized, the entire database is update
// after every set.
// TODO: Create a class called CachedDatabase
class UserBadwords {
  static database = new Database(config.replit.databaseUrl);

  static findMessageBadwords(message) {
    const { content } = message;
    const configBadwords = config.discord.badwords;

    let messageBadwords = []

    for (const configBadword of configBadwords) {
      const configBadwordFiltered = confusables.remove(configBadword);
      const contentFiltered = confusables.remove(content);
      const regex = new RegExp(`\\b${configBadwordFiltered}\\b`, "gi");

      for (const result of contentFiltered.match(regex)) {
        messageBadwords.push(result);
      }
    }

    return messageBadwords;
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


