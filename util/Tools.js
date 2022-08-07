module.exports.error = function (interaction, error, message = null) {
  const { EmbedBuilder } = require("discord.js");
  const bot = require("./../deps/bot");
  const icons = bot.icons;

  const embed = new EmbedBuilder().setColor("DarkRed").setDescription(`${icons.warning} **${error}**`);

  return message
    ? interaction.editReply({ embeds: [embed] }).then(() => setTimeout(() => message.delete(), 1000))
    : interaction.reply({ embeds: [embed], ephemeral: true });
};
