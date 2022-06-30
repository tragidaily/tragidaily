import { MessageEmbed } from "discord.js";

import config from "../../config.js";
import UserBadwords from "../structures/UserBadwords.js";
import { createSlashCommand } from "../builder.js";
import {}
import { getRole, getChannel, getChannelId } from "../utilities/discord.js";


function createReporteEmbed(message, messageBadwordMatch) {
  const { author } = message;

  const content = boldSubstringFromMatch(message.content, messageBadwordMatch);

  return new MessageEmbed()
    .setTitle("Reporte")
    .setDescription("Atenção! Um usuário disse uma palavra proibida.")
    .setURL(message.url)
    .setAuthor(author.username)
    .setThumbnail(author.avatar)
    .setColor(author.badwords.getColor())
    .setTimestamp()
    .addField("nome", author.username, true)
    .addField("id", author.id, true)
    .addField("mensagem", content);
}

function createComportamentoEmbed(member, options) {
  const usuario = options.getUser("usuario");
  const mostrar = options.getBoolean("mostrar");

  usuario.badwords = new UserBadwords(usuario);

  const interactionEmbed = new MessageEmbed()
    .setTitle("Comportamento")
    .setDescription(usuario.badwords.getDescription())
    .setAuthor(usuario.username)
    .setThumbnail(usuario.avatar)
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

    for (const messageBadwordMatch of message.badwordsMatches) {
      const messageBadword = messageBadwordMatch[0];

      author.badwords.incrementCounter(messageBadword);

      const channel = getChannel(client, "report");
      const reporteEmbed = createReporteEmbed(message, messageBadwordMatch);

      channel.send({ embeds: [reporteEmbed] });
    }
  },

  async execute(interaction) {
    const { member, options } = interaction;

    const comportamentoEmbed = createComportamentoEmbed(member, options);

    action.reply({ embeds: [comportamentoEmbed] });
  },
};

export default command;
