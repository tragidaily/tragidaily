import { MessageEmbed } from "discord.js";

import config from "../../config.js";
import { createSlashCommand } from "../builder.js";
import { checkURL, hasURL } from "../utils/url.js";
import { getRole, getChannel, getChannelId } from "../utils/discord.js";

function createMessageEmbedFooter(user) {
  const { options, username } = user;

  const autor = options.get("autor");
  const footerPublicador = `Publicado por: ${username}`;
  const footerAutor = autor ? ` - Autor: ${autor}` : "";

  return {
    text: `${footerPublicador}${footerAutor}`,
    iconURL: user.avatarURL(),
  };
}

function createMessageEmbed(user) {
  const { colors } = config.discord;
  const { options } = user;

  checkURL(options.getString("fonte"));
  checkURL(options.getString("imagem"));

  const messageEmbed = new MessageEmbed()
    .setURL(options.getString("fonte"))
    .setTitle(options.getString("titulo"))
    .setDescription(options.getString("descricao"))
    .setImage(options.getString("imagem"))
    .setColor(colors[options.getString("cor")] || colors["vermelho"])
    .setFooter(createMessageEmbedFooter(user))
    .setThumbnail("./images/tragidaily.png")
    .setTimestamp();

  const subtitulo = options.getString("subtitulo");
  const subdescricao = options.getString("subdescricao");

  if (subtitulo) {
    messageEmbed.addFields({
      name: subtitulo,

      // NOTE: Deveria ser um "-"?
      value: subdescricao || "-",
    });
  }

  return messageEmbed;
}

const command = {
  data: createSlashCommand("./diario.json"),

  async receive(message) {
    const { channelId, attachments, content } = message;

    if (
      (channelId === getChannelId("militadas") ||
       channelId === getChannelId("artes")) &&
      (attachments.size === 0 ||
        hasURL(content) === false)
    ) {
      const oneSecond = 1000;

      await setTimeout(() => message.delete(), oneSecond);
    }
  },

  async execute(interaction) {
    const { member, client, user } = interaction;

    const role = getRole(member, "jornalistaInvestigativo");
    const channel = getChannel(client, role ? "diario" : "jornal");

    try {
      const messageEmbed = createMessageEmbed(user);

      channel.send({ embeds: [messageEmbed] });

      // NOTE: ephemeral = true or false?
      await interaction.reply({
        content: "Sua noticia foi publicada!",
        ephemeral: false,
      });

      // NOTE: Why deleteReply after reply?
      // interaction.deleteReply();
    } catch (error) {
      if (error.code === "ERR_INVALID_URL") {
        await interaction.reply({
          content: "URL invalido. Tente novamente!",
          ephemeral: true,
        });
      } else {
        throw error;
      }
    }
  },
};

export default command;
