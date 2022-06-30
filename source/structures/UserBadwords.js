import Database from "@replit/database";


// TODO: Update the database structure. Rename the key "usersData" to
// "users" and change the value of "usersData" from { "users": { ... } } to
// { ... }.
// TODO: This code need to be optimized, the entire database is update after
// every set.
// TODO: Reduce database requests through cache.
// TODO: Create a class called CachedDatabase.

// TODO: Counter ou Count?

// TODO: Colocar acentos em todas as mensagens que serao mostradas ao usuario.
// TODO: Criar um CONTRIBUTING.md avisando para apenas colocar acentos em
// mensagens que serao mostradas ao usuario, em todos os outros casos nao.

// TODO: Renomear getMatches para get

// TODO: Criar atributos privados, por exemplo, database, user, message, ...

class UserBadwords {
  static database = new Database(config.replit.databaseUrl);

  static getMessageBadwordsMatches(message) {
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
      data[this.user.id] = { badwords: { count: 0 } };
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
    }

    if (total < 50) {
      return `Opa! Percebemos um número um pouco frequente de palavras ofensivas ditas nos canais livres, vamos maneirar!
O número de palavras ofensivas ditas é: **Abaixo de 50!**`;
    }

    return `Você parecer ter um comportamento um pouco excessivo...
Caso haja denúncias, o seu histórico poderá influenciar na sua punição.
O número de palavras ofensivas ditas é: **Acima de 50!**`;
  }

  async getColor() {
    const { colors } = config.discord;
    const total = await this.getTotal();

    if (total < 10) {
      return colors.branco;
    }

    if (total < 50) {
      return colors.amarelo;
    }

    return colors.vermelho;
  }

  async incrementCount(badword) {
    const data = await this.get();

    data[badword].count +=  1;

    await this.set(data);
  }

  async incrementCountFromMessage(messageBadwords) {
    const promises = []

    for (const messageBadwordMatch of messageBadwords.getMatches()) {
      const messageBadwordString = messageBadwordMatch[0];

      promises.push(userBadwords.incrementCounter(messageBadwordString));
    }

    await promises;
  }
}

export default UserBadwords;
