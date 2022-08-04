const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { discord } = require("../config")

const sendEmbed = async action => {

  const
  { jornalistaInvestigativo, patrocinador, sub } = discord.roles,
  channels = discord.channels.newsChannels,
  user = await action.member.fetch(),
  getProfile = await action.user.fetch(),
  title = action.options.getString("título"), 
  description = action.options.getString("descrição"),
  image = action.options.getAttachment("imagem").url, 
  channelName = action.options.getString("canal"),
  channel = (await action.guild.channels.fetch()).get(channels[channelName]),
  subtitle = action.options.getString("subtitulo"), 
  subdescription = action.options.getString("subdescrição"),
  source = action.options.getString("fonte"),
  color = action.options.getString("cor");

  const exampleEmbed = new EmbedBuilder()
        .setTitle(title)
        .setColor(color) .setThumbnail("https://cdn.discordapp.com/attachments/985892754271911936/1004266803750506616/tragidaily.png")
        .setImage(image)
        .setTimestamp()
        .setFooter({
          text: `Autor: ${getProfile.tag}`,
          iconURL: getProfile.avatarURL(),
        });

  if (description) {
    exampleEmbed.setDescription(description);
  }

  if (source) {
    exampleEmbed.setURL(source);
  }
  
  if (subtitle||subdescription) {
    let field = { name: "-", value: "-" };
    if (subtitle) field["name"] = subtitle;
    if (subdescription) field["value"] = subdescription;
    exampleEmbed.addFields(field);
  }

  if (channelName == "tc_diario") {
    const roles = [jornalistaInvestigativo, sub, patrocinador];
    let hasRole = false;
    for (let role of roles) {
     if (user.roles.cache.get(role.id)) {
      hasRole = true;
     }
    }
    if (!hasRole) {
      action.reply({
        content: "Você não tem permissão para enviar neste canal.",
        ephemeral: true
      })
      return;
    }
  }
  channel.send({
    embeds: [exampleEmbed]
  })
  action.reply({
    content: "Postagem publicada!",
    ephemeral: true
  })
}


module.exports = {
  data: new SlashCommandBuilder()
    .setName("postar")
    .setDescription("divulgue um acontecimento!!")
    .addStringOption((option) =>
      option
        .setName("título")
        .setDescription("escreva seu título!")
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
    option
      .setName("imagem")
      .setDescription("adicione uma imagem.")
      .setRequired(true)
  )
  .addStringOption((option) =>
  option.setName("cor").setDescription("escolha uma cor para a exibição.")
  .addChoices(
    {name:"vermelho", value: "#ed0000"},
      {name:"laranja", value: "#ff8000"},
      {name:"amarelo", value: "#fff200"},
      {name:"verde", value:"#48ff00"},
      {name:"azul", value:"#005eff"},
      {name:"roxo", value:"#a600ed"},
      {name:"rosa", value:"#ff00f7"},
      {name:"branco", value: "#ffffff"},
      {name:"preto", value:"#000000"}
  )
  .setRequired(true)
)
.addStringOption(option => 
  option.setName("canal")
  .setDescription("canal a ser enviada a postagem")
  .addChoices(
    {name:"tc-diário", value:"tc_diario"},
    {name:"militadas-erradas", value:"militadas_erradas"},
    {name:"jornal-local", value:"jornal_local"}
  )
  .setRequired(true)
  )
    .addStringOption((option) =>
      option
        .setName("descrição")
        .setDescription("descreva sua notícia.")
    )
    .addStringOption((option) =>
      option.setName("subtitulo").setDescription("adicione um subtitulo.")
    )
    .addStringOption((option) =>
      option
        .setName("subdescrição")
        .setDescription("adicione uma descrição ao subtitulo.")
    )
    .addStringOption((option) =>
      option.setName("fonte").setDescription("adicione uma fonte a notícia.")
    ),
  async execute(interaction) {
    const action = await interaction;
    try {
      await sendEmbed(action);
    } catch (error) {
      action.reply({
        content: "URL inválido. Tente novamente!",
        ephemeral: true,
      });
      console.log(error)
    }
  },
};
