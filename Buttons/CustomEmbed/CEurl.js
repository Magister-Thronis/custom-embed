const { EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  id: "CEurl",
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

    const urlEmbed = new EmbedBuilder().setColor("F4D58D").setAuthor({
      name: `${guild.name} | Editing url`,
      iconURL: guild.iconURL({
        dynamic: true,
        size: 512,
      }),
    }).setDescription(`
      **to Set:** \`send a message in chat\`
      `);

    interaction.message.edit({ embeds: [urlEmbed, embeds[1]] });

    let msgEmbed = new EmbedBuilder().setColor("F4D58D").setDescription("**Enter a URL:**");
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
      // check if the message is a url
      if (
        !m.content.match(
          /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/gi
        )
      ) {
        return error(interaction, "invalid url", m);
      }

      interaction.editReply({
        embeds: [msgEmbed.setDescription(`**URL set to:** \`${m.content}\``)],
      });

      const url = m.content.length > remaining ? m.content.substring(0, remaining) : m.content;

      modifiedEmbed = EmbedBuilder.from(embeds[1]).setURL(url);

      interaction.message
        .edit({
          embeds: [urlEmbed, modifiedEmbed],
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
