const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  id: "CEthumbnail",
  permission: PermissionFlagsBits.ManageMessages,

  async execute(interaction, client) {
    // embeds
    const embeds = interaction.message.embeds;
    let modifiedEmbed = embeds[1];

    // utilities
    const error = client.tools.error;

    const thumbnailEmbed = client.tools.embeds.thumbnailEmbed;

    interaction.message.edit({ embeds: [thumbnailEmbed, embeds[1]] });

    let msgEmbed = new EmbedBuilder().setColor("F4D58D").setDescription("**Enter a direct image link:**");
    interaction.reply({ embeds: [msgEmbed] });

    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
    });

    client.tools.buttons(client, interaction, collector);

    collector.on("collect", (m) => {
      let image = "";

      image = m.content;

      // check if image is valid picture url
      if (!image.match(/\.(jpeg|jpg|png)$/) || !image.match(/^https?:\/\//)) {
        return error(interaction, "Invalid image link", m);
      }

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
  },
};
