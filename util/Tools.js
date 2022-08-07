module.exports.error = function (interaction, error, message = null) {
  const { EmbedBuilder } = require("discord.js");

  const embed = new EmbedBuilder().setColor("DarkRed").setDescription(`**${error}**`);

  return message
    ? interaction.editReply({ embeds: [embed] }).then(() => setTimeout(() => message.delete(), 1000))
    : interaction.reply({ embeds: [embed], ephemeral: true });
};
