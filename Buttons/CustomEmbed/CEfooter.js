const { EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  id: "CEfooter",
  permission: PermissionFlagsBits.Administrator,

  async execute(interaction, client) {
    const { guild } = interaction;

    // embeds
    const embeds = interaction.message.embeds;
    let modifiedEmbed = embeds[1];

    //components
    const rows = interaction.message.components;

    // utilities
    const error = client.tools.error;
    const remaining = 6000 - embeds[1].length;

    const FooterEmbed = new EmbedBuilder().setColor("F4D58D").setAuthor({
      name: `${guild.name} | Editing footer`,
      iconURL: guild.iconURL({
        dynamic: true,
        size: 512,
      }),
    }).setDescription(`
      **to Set:** \`send a message in chat\`
      `);

    interaction.message.edit({ embeds: [FooterEmbed, embeds[1]] });

    let msgEmbed = new EmbedBuilder().setColor("F4D58D").setDescription("**Enter a Footer:**");
    interaction.reply({ embeds: [msgEmbed] });

    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
    });

    // util buttons
    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("cancel").setStyle(ButtonStyle.Secondary).setLabel("cancel")
    );

    const buttonFilter = (u) => u.user.id === interaction.user.id;
    buttonCollector = interaction.message.createMessageComponentCollector({
      filter: buttonFilter,
    });

    interaction.message.edit({
      components: [buttonRow],
    });

    buttonCollector.on("collect", (btnInt) => {
      if (btnInt.component.customId === "cancel") {
        btnInt
          .reply({ embeds: [new EmbedBuilder().setColor("F4D58D").setDescription("**Canceled**")] })
          .then(() => setTimeout(() => btnInt.deleteReply(), 1000));

        buttonCollector.stop();
        collector.stop();
      }
    });

    collector.on("collect", (m) => {
      if (m.content.length >= 1024) {
        return error(interaction, "Footer is too long", m);
      }

      interaction.editReply({
        embeds: [msgEmbed.setDescription(`**Footer set to:** \`${m.content}\``)],
      });

      const footer = m.content.length > remaining ? m.content.substring(0, remaining) : m.content;

      modifiedEmbed = EmbedBuilder.from(embeds[1]).setFooter({ text: footer });

      interaction.message
        .edit({
          embeds: [FooterEmbed, modifiedEmbed],
        })
        .then(() => setTimeout(() => m.delete(), 1000));
    });
    collector.on("end", () => {
      interaction.message
        .edit({
          embeds: [embeds[0], modifiedEmbed],
          components: rows,
        })
        .then(interaction.deleteReply());
      return;
    });
  },
};
