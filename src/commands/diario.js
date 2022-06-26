import { MessageEmbed } from "discord.js";
import * as linkify from "linkifyjs";

import { createSlashCommand } from "../builder.js";
import config from "../../config.js";

function createMessageEmbed(options, user) {
  let url = new URL(options.getString("imagem"));
  let autor = "";
  if (options.getString("autor")) {
    autor = " - Autor: " + options.getString("autor");
  }

  const exampleEmbed = new MessageEmbed()
    .setColor("#b80000")
    .setTitle(options.getString("título"))
    .setDescription(options.getString("descrição"))
    .setThumbnail(
      "https://cdn.discordapp.com/attachments/844699066930954302/968664576013004861/Tragi.png"
    )
    .setImage(options.getString("imagem"))
    .setTimestamp()
    .setFooter({
      text: "Publicado por: " + user.username + autor,
      iconURL: user.avatarURL(),
    });

  let subtitulo = options.getString("subtitulo"),
    subdescrição = options.getString("subdescrição");
  let fonte = options.getString("fonte"),
    cor = options.getString("cor");

  if (fonte) {
    let url2 = new URL(fonte);
    exampleEmbed.setURL(fonte);
  }

  if (cor) {
    let cores = {
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
    if (cores[cor]) {
      exampleEmbed.setColor(cores[cor]);
    }
  }

  if (subtitulo) {
    let field = { name: subtitulo, value: "-" };
    if (subdescrição) field["value"] = subdescrição;
    exampleEmbed.addFields(field);
  }

  return exampleEmbed;
}

const data = createSlashCommand("./diario.json");

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
  const { client, member } = interaction;

  try {
    const role = member.roles.cache.get(roles.jornalistaInvestigativo);
    const channelId = role ? channels.diario.id : channels.journal.id;
    const channel = client.channels.cache.get(channelId);
    const embed = createMessageEmbed();

    channel.send({ embeds: [exampleEmbed] });

    await interaction.reply({
      content: "Sua noticia foi publicada!",
      ephemeral: false,
    });
    interaction.deleteReply(); // NOTE: Why deleteReply after reply?!?!?
  } catch (error) {
    await interaction.reply({
      content: "URL invalido. Tente novamente!",
      ephemeral: true,
    });
  }
}

const command = { data, receive, execute };

export default command;
