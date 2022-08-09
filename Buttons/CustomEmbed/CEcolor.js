const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  id: "CEcolor",
  permission: PermissionFlagsBits.ManageMessages,

  async execute(interaction, client) {
    // embeds
    const embeds = interaction.message.embeds;
    let modifiedEmbed = embeds[1];

    // utilities
    const error = client.tools.error;

    const colorEmbed = client.tools.embeds.colorEmbed;

    interaction.message.edit({
      embeds: [colorEmbed, embeds[1]],
    });

    let msgEmbed = new EmbedBuilder().setColor("F4D58D").setDescription("Enter a HEX color code:");

    interaction.reply({ embeds: [msgEmbed] });

    //create message collector
    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
    });

    let color = "";

    client.tools.buttons(client, interaction, collector, "color");

    collector.on("collect", (m) => {
      if (!m.content.match(/[0-9A-Fa-f]{6}/g)) {
        return error(interaction, `\`${m.content}\` - invalid color code`, m);
      }

      const hexToDecimal = (hex) => parseInt(hex, 16);

      if (hexToDecimal(m.content) > 16777215 || hexToDecimal(m.content) < 0) {
        return error(interaction, `\`${m.content}\`*- is out of Range`, m);
      }

      color = m.content;

      interaction.editReply({
        embeds: [EmbedBuilder.from(msgEmbed).setDescription(`Color set to:\`${color}\``).setColor(`${color}`)],
      });

      modifiedEmbed = EmbedBuilder.from(embeds[1]).setColor(color);

      interaction.message
        .edit({
          embeds: [colorEmbed, modifiedEmbed],
        })
        .then(() => setTimeout(() => m.delete(), 1000));
    });
  },
};
