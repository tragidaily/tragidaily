import { MessageEmbed } from "discord.js";

import { createSlashCommand } from "../builder.js";
import { checkURL, hasURL } from "../urlutils.js";
import config from "../../config.js";

function createMessageEmbed(user) {
  const { options } = user;

  checkURL(options.getString("fonte"));
  checkURL(options.getString("imagem"));

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
    .setURL(options.getString("fonte"))
    .setTitle(options.getString("titulo"))
    .setDescription(options.getString("descricao"))
    .setImage(options.getString("imagem"))
    .setColor(colors[options.getString("cor")])
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
  data: createSlashCommand("./diario.json"),

  async receive(message) {
    const { militadas, artes } = config.discord.channels;
    const { channelId, attachments, content } = message;

    if (
      (channelId === militadas.id || channelId === artes.id) &&
      (attachments.size === 0 && !includesURL(content))
    ) {
      await setTimeout(() => message.delete(), 1000);
    }
  }

  async execute(interaction) {
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
  }
};

export default command;
