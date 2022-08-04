const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    InteractionType,
    InteractionCollector
  } = require("discord.js");
  const { discord } = require("../config")
  const users = {};
  
  const collectMessage = async (action) => {
      const source = await action.user.fetch();
      const channels = await action.guild.channels.fetch();
      const channel = channels.get(discord.channels.suggestionChannel);
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
          if(event.customId === "suggestion") {
            await event.reply({ content: 'A sua sugestão pode ser enviada com sucesso.', ephemeral: true })
          }
          else return;
          const title = event.fields.getTextInputValue("idea");
          const description = event.fields.getTextInputValue("description");
          const embed = new EmbedBuilder()
              .setTitle(title)
              .setDescription(description)
              .setFooter({ text: "Autor: " + source.tag , iconURL: source.avatarURL() })
              .setColor("#d60000")
              .setTimestamp();
  
          await channel.send({
          embeds:[embed]
          })

          users[id] = false;
          collector.stop();
          })
  }
  
  const sendDenounce = async (action) => {
      
      const modal = new ModalBuilder()
          .setCustomId("suggestion")
          .setTitle("Sugestão");
  
      const reason = new TextInputBuilder()
          .setCustomId('idea')
          .setLabel("Ideia: ")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);
  
      const description = new TextInputBuilder()
          .setCustomId('description')
          .setLabel("Desenvolvimento: ")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);
  
      const firstActionRow = new ActionRowBuilder().addComponents(reason);
      const secondActionRow = new ActionRowBuilder().addComponents(description);
  
      modal.addComponents(firstActionRow, secondActionRow);
  
      await action.showModal(modal);
  };
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("sugestão")
      .setDescription("faz uma sugestão para o server."),
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
  