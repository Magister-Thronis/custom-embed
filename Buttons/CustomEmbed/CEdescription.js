const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  id: "CEdescription",
  permission: PermissionFlagsBits.ManageMessages,

  async execute(interaction, client) {
    // embeds
    const embeds = interaction.message.embeds;
    let modifiedEmbed = embeds[1];

    // utilities
    const error = client.tools.error;
    const remaining = 6000 - embeds[1].length;

    const descriptionEmbed = client.tools.embeds.descriptionEmbed;

    interaction.message.edit({ embeds: [descriptionEmbed, embeds[1]] });

    let msgEmbed = new EmbedBuilder().setColor("F4D58D").setDescription("**Enter a description:**");
    interaction.reply({ embeds: [msgEmbed] });

    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
    });

    client.tools.buttons(client, interaction, collector);

    collector.on("collect", (m) => {
      if (m.content.length >= 4096) {
        return error(interaction, "**Description is too long**", m);
      }

      interaction.editReply({
        embeds: [msgEmbed.setDescription(`**Enter a new description:**`)],
      });

      const description = m.content.length > remaining ? m.content.substring(0, remaining) : m.content;

      modifiedEmbed = EmbedBuilder.from(embeds[1]).setDescription(`${description}`);

      interaction.message
        .edit({
          embeds: [descriptionEmbed, modifiedEmbed],
        })
        .then(() => setTimeout(() => m.delete(), 1000));
    });
  },
};
