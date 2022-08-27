const { EmbedBuilder, PermissionFlagsBits} = require("discord.js");

module.exports = {
  id: "CEfooter",
  permission: PermissionFlagsBits.ManageMessages,

  async execute(interaction, client) {
    // embeds
    const embeds = interaction.message.embeds;
    let modifiedEmbed = embeds[1];

    // utilities
    const error = client.tools.error;
    const remaining = 6000 - embeds[1].length;

    const FooterEmbed = client.tools.embeds.footerEmbed;

    interaction.message.edit({ embeds: [FooterEmbed, embeds[1]] });

    let msgEmbed = new EmbedBuilder().setColor("F4D58D").setDescription("**Enter a Footer:**");
    interaction.reply({ embeds: [msgEmbed] });

    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
    });

    client.tools.buttons(client, interaction, collector);

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
  },
};
