const { EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const bot = require("../../deps/bot");

module.exports = {
  id: "CEthumbnail",
  permission: PermissionFlagsBits.Administrator,

  async execute(interaction, client) {
    const { guild } = interaction;

    // embeds
    const embeds = interaction.message.embeds;
    let modifiedEmbed = embeds[1];

    //components
    const rows = interaction.message.components;

    // utilities
    const icons = bot.icons;
    const error = client.tools.error;

    const thumbnailEmbed = new EmbedBuilder().setColor("F4D58D").setAuthor({
      name: `${guild.name} | Editing thumbnail`,
      iconURL: guild.iconURL({
        dynamic: true,
        size: 512,
      }),
    }).setDescription(`
      ${icons.text5} **to Set:** \`Send a [DIRECT] image link in chat\`
      ${icons.text5} **or:** \`Upload any JPG / PNG file\`
      `);

    interaction.message.edit({ embeds: [thumbnailEmbed, embeds[1]] });

    let msgEmbed = new EmbedBuilder().setColor("F4D58D").setDescription("**Enter a direct image link:**");
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
      let image = "";

      if (m.attachments.size > 0) {
        if (m.attachments.first().name.endsWith(".jpg") || m.attachments.first().name.endsWith(".png")) {
          image = m.attachments.first().url;
        }
      } else {
        image = m.content;
      }

      // cheack if image is valid picture
      if (!image.includes("http")) return error(interaction, "Invalid image link", m);
      if (!image.endsWith(".jpg") && !image.endsWith(".png")) return error(interaction, "Invalid image link", m);

      interaction.editReply({
        embeds: [msgEmbed.setDescription(`**Send a new link to update the image**`)],
      });

      modifiedEmbed = EmbedBuilder.from(embeds[1]).setThumbnail(image);

      interaction.message
        .edit({
          embeds: [thumbnailEmbed, modifiedEmbed],
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
