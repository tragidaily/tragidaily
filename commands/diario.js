import { MessageEmbed } from "discord.js";
import * as linkify from "linkifyjs";

import { createSlashCommand } from "../builder.js";
import config from "../config.js";

function createMessageEmbed(options, user) {
  let url = new URL(action.options.getString("imagem"));
  let autor = "";
  if (action.options.getString("autor")) {
    autor = " - Autor: " + action.options.getString("autor");
  }

  const exampleEmbed = new MessageEmbed()
    .setColor("#b80000")
    .setTitle(action.options.getString("título"))
    .setDescription(action.options.getString("descrição"))
    .setThumbnail(
      "https://cdn.discordapp.com/attachments/844699066930954302/968664576013004861/Tragi.png"
    )
    .setImage(action.options.getString("imagem"))
    .setTimestamp()
    .setFooter({
      text: "Publicado por: " + action.user.username + autor,
      iconURL: action.user.avatarURL(),
    });

  let subtitulo = action.options.getString("subtitulo"),
    subdescrição = action.options.getString("subdescrição");
  let fonte = action.options.getString("fonte"),
    cor = action.options.getString("cor");

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


}

const data = createSlashCommand("./diario.json");

async function receive(message) {
  const { channelId, attachments, content } = message;
  const { militadas, artes } = config.discord.channels;

  if (
    (channelId == militadas.id || channelId == artes.id) &&
    (!attachments.size && !linkify.test(content, "url"))
  ) {
    setTimeout(() => message.delete(), 1000);
  }
}

async function execute(interaction) {
  const { diario, journal } = config.discord.channels;
  try {
    if (interaction.member.roles.cache.get("968688946043310150")) {
      interaction.client.channels.cache
        .find((channel) => channel.id == diarioChannelId)
        .send({ embeds: [exampleEmbed] });
      interaction.reply({
        content: "Sua notícia foi publicada!",
        ephemeral: false,
      });
      interaction.deleteReply();
    } else {
      interaction.client.channels.cache
        .find((channel) => channel.id == jornalChannelId)
        .send({ embeds: [exampleEmbed] });
      interaction.reply({
        content: "Sua notícia foi publicada!",
        ephemeral: false,
      });
      interaction.deleteReply();
    }
  } catch (error) {
    await interaction.reply({
      content: "URL inválido. Tente novamente!",
      ephemeral: true,
    });
  }
}

const command = { data, receive, execute };

export default command;
