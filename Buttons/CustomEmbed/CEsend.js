const { PermissionFlagsBits } = require("discord.js");
const db = require("../../schemas/embed");

module.exports = {
  id: "CEsend",
  permission: PermissionFlagsBits.ManageMessages,

  async execute(interaction, client) {
    const { guild, user } = interaction;

    // embeds
    const embeds = interaction.message.embeds;

    // components
    const rows = interaction.message.components;

    // find doc
    let data = await db.findOne({ _id: guild.id });

    // find userObject
    let userObject = await data.users.find((u) => u.userId === user.id);

    const EMBED_CHANNEL = client.channels.cache.get(userObject.sendChannel);

    async function fetch(channel, msg) {
      const message = await channel.messages.fetch(msg);
      return message;
    }

    if (userObject.messageId) {
      const message = await fetch(EMBED_CHANNEL, userObject.messageId);
      await message.edit({ embeds: [embeds[1]] });

      interaction.message.delete();
      interaction.reply({ content: "updated embed", ephemeral: true });

      delete userObject["sendChannel"];
      delete userObject["messageId"];
      delete userObject["interactionMessage"];
      delete userObject["interactionChannel"];
      data.markModified("users");
      await data.save();
    } else {
      const sendMessage = userObject.sendMessage;

      sendMessage
        ? EMBED_CHANNEL.send({ content: userObject.sendMessage, embeds: [embeds[1]] })
        : EMBED_CHANNEL.send({ embeds: [embeds[1]] });

      interaction.message.delete();
      interaction.reply({ content: "sent embed", ephemeral: true });

      delete userObject["sendChannel"];
      delete userObject["sendMessage"];
      delete userObject["interactionMessage"];
      delete userObject["interactionChannel"];

      data.markModified("users");
      await data.save();
    }
  },
};
