const { CommandInteraction, InteractionType } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {CommandInteraction} interaction
   */

  async execute(interaction, client) {
    const command = client.commands.get(interaction.commandName);

    if (interaction.isChatInputCommand()) {
      if (!command) return interaction.reply({ content: "This command is outdated!" });

      command.execute(interaction, client);
    }

    if (interaction.type == InteractionType.ApplicationCommandAutocomplete) {
      command.autocomplete(interaction, client);
    }
  },
};
