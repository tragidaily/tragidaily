import { MessageEmbed } from "discord.js";

import UserBadwords from "../structures/UserBadwords.js";
import MessageBadwords from "../structures/MessageBadwords.js";
import { createSlashCommand } from "../builder.js";
import { boldSubstringFromMessageBadword } from "../utilities/markdown.js";
import { getRole, getChannel, getChannelId } from "../utilities/discord.js";

function createReporteEmbed(message, messageBadword) {
  const { author, content, url } = message;

  const contentWithBold =
    boldSubstringFromMessageBadword(content, messageBadword);

  return new MessageEmbed()
    .setTitle("Reporte")
    .setDescription("Atenção! Um usuário disse uma palavra proibida.")
    .setURL(url)
    .setAuthor(author.username)
    .setThumbnail(author.avatar)
    .setColor(author.badwords.getColor())
    .setTimestamp()
    .addField("nome", author.username, true)
    .addField("id", author.id, true)
    .addField("mensagem", contentWithBold);
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
      interactionEmbed.addField(
        "Lista de Palavras",
        usuario.badwords.toString() || "Não temos palavras!"
      );
    } else {
      interactionEmbed.addField(
        "Lista de Palavras",
        "Você não ter permissão para ver a lista de palavras!"
      );
    }
  }
}

const command = {
  data: createSlashCommand("./comportamento.json"),

  async receive(message) {
    const { channelId, author, client } = message;

    if (
      channelId === getChannelId("submundoChat") ||
      channelId === getChannelId("submundoHumorNegro") ||
      author.bot
    ) {
      return;
    }

    const userBadwords = new UserBadwords(author);
    const messageBadwords = new MessageBadwords(message);

    await userBadwords.incrementCountFromMessageBadwords(messageBadwords);

    for (const messageBadword of messageBadwords.get()) {
      const channel = getChannel(client, "report");
      const reporteEmbed = createReporteEmbed(message, messageBadword);

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
