import { MessageEmbed } from "discord.js";
import * as linkify from "linkifyjs";

import { createSlashCommand } from "../builder.js";
import config from "../../config.js";

function createMessageEmbed(user) {
  const { options } = user;

  // TODO: Check if Image and URL are valid URLs.

  const colors = {
    undefined: "#b80000",
    vermelho: "#ed0000",
    laranja: "#ff8000",
    amarelo: "#fff200",
    verde: "#48ff00",
    azul: "#005eff",
    roxo: "#a600ed",
    rosa: "#ff00f7",
    branco: "#ffffff",
    preto: "#000000",
  };

  const messageEmbed = new MessageEmbed()
    .setURL(options.getString("fonte")
    .setTitle(options.getString("titulo"))
    .setDescription(options.getString("descricao"))
    .setImage(options.getString("imagem"))
    .setColor(colors[options.get("cor")])
    .setThumbnail("./images/tragidaily.png")
    .setTimestamp();

  const subtitulo = options.getString("subtitulo");
  const subdescricao = options.getString("subdescricao");

  if (subtitulo) {
    messageEmbed.addFields({
      name: subtitulo,
      value: subdescricao || "-",  // NOTE: Deveria ser um traço?
    });
  }

  const autor = options.get("autor");
  const footerPublicador = `Publicado por: ${user.username}`
  const footerAutor = autor ? ` - Autor: ${autor}` : "";

  messageEmbed.setFooter({
    text: `${footerPublicador}${footerAutor}`,
    iconURL: user.avatarURL(),
  })

  return messageEmbed;
}

const command = {
  data: createSlashCommand("./diario.json");

  async function receive(message) {
    const { militadas, artes } = config.discord.channels;
    const { channelId, attachments, content } = message;

    if (
      (channelId == militadas.id || channelId == artes.id) &&
      (!attachments.size && !linkify.test(content, "url"))
    ) {
      setTimeout(() => message.delete(), 1000);
    }
  }

  async function execute(interaction) {
    const { channels, roles } = config.discord;
    const { client, member, user } = interaction;

    const roleId = roles.jornalistaInvestigativo.id;
    const role = member.roles.cache.get(roleId);
    const channelId = role ? channels.diario.id : channels.journal.id;
    const channel = client.channels.cache.get(channelId);

    try {
      const messageEmbed = createMessageEmbed(user);

      channel.send({ embeds: [messageEmbed] });

      await interaction.reply({
        content: "Sua noticia foi publicada!",
        ephemeral: false, // NOTE: true or false?
      });
      // NOTE(Virgulas): Why deleteReply after reply?
      // interaction.deleteReply();
    } catch (error) {
      // TODO: This error will always be because an invalid URL? NO!!!
      await interaction.reply({
        content: "URL invalido. Tente novamente!",
        ephemeral: true,
      });
    }
  }
};

export default command;
