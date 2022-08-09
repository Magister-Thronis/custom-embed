const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  id: "CEurl",
  permission: PermissionFlagsBits.ManageMessages,

  async execute(interaction, client) {
    // embeds
    const embeds = interaction.message.embeds;
    let modifiedEmbed = embeds[1];

    // utilities
    const error = client.tools.error;
    const remaining = 6000 - embeds[1].length;

    const urlEmbed = client.tools.embeds.urlEmbed;

    interaction.message.edit({ embeds: [urlEmbed, embeds[1]] });

    let msgEmbed = new EmbedBuilder().setColor("F4D58D").setDescription("**Enter a URL:**");
    interaction.reply({ embeds: [msgEmbed] });

    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
    });

    client.tools.buttons(client, interaction, collector);

    collector.on("collect", (m) => {
      // check if the message is a valid url
      // must start with http(s)://
      if (!m.content.startsWith("http")) {
        return error(interaction, "Invalid URL", m);
      }
      if (m.content.length >= 256) {
        return error(interaction, "URL is too long", m);
      }
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
  },
};
