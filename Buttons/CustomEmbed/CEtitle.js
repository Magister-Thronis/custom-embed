const { EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  id: "CEtitle",
  permission: PermissionFlagsBits.ManageMessages,

  async execute(interaction, client) {
    // embeds
    const embeds = interaction.message.embeds;
    let modifiedEmbed = embeds[1];

    // utilities
    const error = client.tools.error;
    const remaining = 6000 - embeds[1].length;

    const titleEmbed = client.tools.embeds.titleEmbed;

    interaction.message.edit({ embeds: [titleEmbed, embeds[1]] });

    let msgEmbed = new EmbedBuilder().setColor("F4D58D").setDescription("**Enter a title:**");
    interaction.reply({ embeds: [msgEmbed] });

    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
    });

    client.tools.buttons(client, interaction, collector);

    collector.on("collect", (m) => {
      if (m.content.length >= 256) {
        return error(interaction, "Title is too long", m);
      }

      interaction.editReply({
        embeds: [msgEmbed.setDescription(`**Title set to:** \`${m.content}\``)],
      });

      const title = m.content.length > remaining ? m.content.substring(0, remaining) : m.content;

      modifiedEmbed = EmbedBuilder.from(embeds[1]).setTitle(title);

      interaction.message
        .edit({
          embeds: [titleEmbed, modifiedEmbed],
        })
        .then(() => setTimeout(() => m.delete(), 1000));
    });
  },
};
