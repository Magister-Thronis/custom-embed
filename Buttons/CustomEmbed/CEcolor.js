const { EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const bot = require("../../deps/bot");

module.exports = {
  id: "CEcolor",
  permission: PermissionFlagsBits.Administrator,

  async execute(interaction, client) {
    const { guild } = interaction;

    // embeds
    const embeds = interaction.message.embeds;
    let modifiedEmbed = embeds[1];

    // components
    const rows = interaction.message.components;

    // utilities
    const icons = bot.icons;
    const error = client.tools.error;

    const colorEmbed = new EmbedBuilder().setColor("F4D58D").setAuthor({
      name: `${guild.name} | Editing color`,
      iconURL: guild.iconURL({
        dynamic: true,
        size: 512,
      }),
    }).setDescription(`
      ${icons.text5} **to Set:** \`send a hex color code in chat\`
      `);

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

    // util buttons
    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("cancel").setStyle(ButtonStyle.Secondary).setLabel("cancel"),
      new ButtonBuilder().setCustomId("random").setStyle(ButtonStyle.Secondary).setLabel("random")
    );

    const buttonFilter = (u) => u.user.id === interaction.user.id;
    buttonCollector = interaction.message.createMessageComponentCollector({
      filter: buttonFilter,
    });

    interaction.message.edit({
      components: [buttonRow],
    });

    buttonCollector.on("collect", (btnInt) => {
      if (btnInt.component.customId === "cancel") {
        btnInt
          .reply({ embeds: [new EmbedBuilder().setColor("F4D58D").setDescription("**Canceled**")] })
          .then(() => setTimeout(() => btnInt.deleteReply(), 1000));

        buttonCollector.stop();
        collector.stop();
      }
      if (btnInt.component.customId === "random") {
        let msgEmbed = new EmbedBuilder().setColor("F4D58D");

        btnInt.deferUpdate();

        let letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }

        modifiedEmbed = EmbedBuilder.from(embeds[1]).setColor(color);

        interaction.message.edit({
          embeds: [colorEmbed, modifiedEmbed],
        });
        interaction.editReply({
          embeds: [EmbedBuilder.from(msgEmbed).setDescription(`Color set to:\`${color}\``).setColor(`${color}`)],
        });
      }
    });

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
    collector.on("end", () => {
      interaction.message
        .edit({
          embeds: [embeds[0], modifiedEmbed],
          components: rows,
        })
        .then(interaction.deleteReply());
      return;
    });
  },
};
