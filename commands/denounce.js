const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle,
  InteractionType,
  InteractionCollector,
} = require("discord.js");
const { discord } = require("../config")
const users = {};

const collectMessage = async (action) => {
    const target = action.options.getUser("usuário");
    const source = action.user;
    const channels = await action.guild.channels.fetch();
    const channel = channels.get(discord.channels.denounceChannel);
    const image = action.options.getAttachment("print");
    const id = action.user.id;
    const options = {
        guild: action.guild,
        interactionType: 5,
        filter: event => event.user.id == source.id
    }
    const collector = new InteractionCollector(action.client, options);

    if (users[id]) {
        collector.stop()
        users[id] = false;
      }

    users[id] = true;

    collector.on("collect", async event => {
        if(event.type !== InteractionType.ModalSubmit) return;
        if(event.customId === "denounce") {
          await event.reply({ content: 'A sua denúncia pode ser enviada com sucesso', ephemeral: true })
        }
        else return;
        const title = event.fields.getTextInputValue("reason");
        const description = event.fields.getTextInputValue("description");
        const embed = new EmbedBuilder()
            .setTitle("Denúncia recebida!")
            .setDescription(`O usuário **${source.tag}** denunciou o usuário **${target.tag}**`)
            .setFields({name: title, value: description})
            .setThumbnail("https://cdn.discordapp.com/attachments/985892754271911936/1004459251034501210/sign-warning-icon-png-7.png")
            .setColor("#d60000")
            .setTimestamp();

        if (image) {
            embed.setImage(image.url);
        }

        channel.send({
        embeds:[embed]
        })
        users[id] = false;
        collector.stop();
        })
}

const sendDenounce = async (action) => {
    
    const modal = new ModalBuilder()
        .setCustomId("denounce")
        .setTitle("Denúncia");

    const reason = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel("Motivo da denúncia: ")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const description = new TextInputBuilder()
        .setCustomId('description')
        .setLabel("Descreva os detalhes do caso: ")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(reason);
    const secondActionRow = new ActionRowBuilder().addComponents(description);

    modal.addComponents(firstActionRow, secondActionRow);

    await action.showModal(modal);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("denunciar")
    .setDescription("denuncia um usuário para a moderação.")
    .addUserOption((option) =>
      option
        .setName("usuário")
        .setDescription("digite o @usuário.")
        .setRequired(true)
    )
    .addAttachmentOption(option => 
        option.setName("print")
        .setDescription("print do que você está denunciando.")),
  async execute(interaction) {
    const action = await interaction;
    try {
      await collectMessage(action);
      await sendDenounce(action);
    } catch (error) {
      console.log(error);
    }
  },
};
