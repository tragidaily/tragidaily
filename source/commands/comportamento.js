import { MessageEmbed } from "discord.js";

import config from "../../config.js";
import UserBadwords from "../structures/UserBadwords.js";
import { createSlashCommand } from "../builder.js";
import { getRole, getChannel, getChannelId } from "../utilities/discord.js";

function createReporteEmbed(message) {
  const { author } = message;

  return new MessageEmbed()
    .setURL(message.url)
    .setTitle("Reporte")
    .setAuthor(author.username)
    .setThumbnail(author.avatar)
    .setColor(author.badwords.getColor())
    .setTimestamp()
    .addField("nome", author.username, true)
    .addField("id", author.id, true)
    .addField("mensagem", message.content, true)
    .addField("link", message.url, true);
}

function createComportamentoEmbed(member, options) {
  const usuario = options.getUser("usuario");
  const mostrar = options.getBoolean("mostrar");

  usuario.badwords = new UserBadwords(usuario);

  const interactionEmbed = new MessageEmbed()
    .setAuthor(usuario.username)
    .setThumbnail(usuario.avatar)
    .setDescription(usuario.badwords.getDescription())
    .setColor(usuario.badwords.getColor());

  if (mostrar) {
    const administrador = getRole(member, "administrador");
    const moderador = getRole(member, "moderador");

    if (administrador || moderador) {
      const userBadwordsString = user.badwords.toString();

      interactionEmbed.addField(
        "Lista de Palavras",
        userBadwordsString || "Não temos palavras!",
      );
    } else {
      interactionEmbed.addField(
        "Lista de Palavras",
        "Você não ter permissão para ver a lista de palavras!",
      );
    }
  }
}

const command = {
  data: createSlashCommand("./comportamento.json"),

  async receive(message) {
    // TODO: Update the database structure. Rename the key "usersData" to
    // "users" and change the value of "usersData" from { "users": { ... } } to
    // { ... }.

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
    message.badwordsMatches = UserBadwords.getMessageBadwordsMatches(message);

    // TODO: Retornar o index da palavra encontrada e usar essa informação depois
    // pra apresentar aos moderadores a palavra na frase em **NEGRITO**
    for (const messageBadwordMatch of message.badwordsMatches) {
      const messageBadword = messageBadwordMatch[0];
      author.badwords.incrementCounter(messageBadword);

      const channel = getChannel(client, "report");

      // TODO: Use a messageEmbed here! Please!
      channel.send(
        `Atenção! Um usuário disse uma palavra proibida:

Nome: ${author.username}
Id: ${author.id}
Mensagem: ${message.content}
Link: ${message.url}`
      );
    }
  },

  async execute(interaction) {
    const { member, options } = interaction;

    const interactionEmbed = createInteractionEmbed(member, options);

    action.reply({ embeds: [interactionEmbed] });
  },
};

export default command;
