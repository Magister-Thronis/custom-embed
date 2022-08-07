const { ButtonInteraction, Client } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    const Button = client.buttons.get(interaction.customId);

    if (!Button) return;

    if (Button.permission && !interaction.member.permissions.has(Button.permission))
      return interaction.reply({
        content: "You don't have the required permissions to use this button!",
        ephemeral: true,
      });

    if (Button.ownerOnly && interaction.member.id !== interaction.guild.ownerId)
      return interaction.reply({
        content: "Sorry, you aren't the server owner!",
        ephemeral: true,
      });

    Button.execute(interaction, client);
  },
};
