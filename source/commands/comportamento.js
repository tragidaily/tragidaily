import { MessageEmbed } from "discord.js";

import UserBadwords from "../structures/UserBadwords.js";
import { createSlashCommand } from "../builder.js";
import { getRole, getChannel, getChannelId } from "../utilities/discord.js";

function createMessageEmbed(member, options) {
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

    const messageBadwords = UserBadwords.findMessageBadwords(message);

    for (const messageBadword of messageBadwords) {
      author.badwords.incrementCounter(messageBadword)
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

    const messageEmbed = createMessageEmbed(member, options);

    action.reply({ embeds: [messageEmbed] });
  },
};

export default command;
