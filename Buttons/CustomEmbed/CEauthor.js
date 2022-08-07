const { EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const bot = require("../../deps/bot");

module.exports = {
  id: "CEauthor",
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

    const authorEmbed = new EmbedBuilder().setColor("F4D58D").setAuthor({
      name: `${guild.name} | Editing author`,
      iconURL: guild.iconURL({
        dynamic: true,
        size: 512,
      }),
    }).setDescription(`
      ${icons.text5} **to Set:** \`tag a user\`
      `);

    interaction.message.edit({
      embeds: [authorEmbed, embeds[1]],
    });

    let msgEmbed = new EmbedBuilder().setColor("F4D58D").setDescription("Tag a user");

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
      new ButtonBuilder().setCustomId("bot").setStyle(ButtonStyle.Secondary).setLabel("bot"),
      new ButtonBuilder().setCustomId("guild").setStyle(ButtonStyle.Secondary).setLabel("guild")
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
      if (btnInt.component.customId === "bot") {
        btnInt.deferUpdate();

        author = {
          name: `${client.user.username}`,
          iconURL: client.user.displayAvatarURL({
            dynamic: true,
            size: 512,
          }),
        };

        modifiedEmbed = EmbedBuilder.from(embeds[1]).setAuthor(author);

        interaction.message.edit({
          embeds: [authorEmbed, modifiedEmbed],
        });
        interaction.editReply({
          embeds: [EmbedBuilder.from(msgEmbed).setDescription(`Author set to:\`${author.name}\``)],
        });
      }
      if (btnInt.component.customId === "guild") {
        btnInt.deferUpdate();

        author = {
          name: `${guild.name}`,
          iconURL: guild.iconURL({
            dynamic: true,
            size: 512,
          }),
        };

        modifiedEmbed = EmbedBuilder.from(embeds[1]).setAuthor(author);

        interaction.message.edit({
          embeds: [authorEmbed, modifiedEmbed],
        });
        interaction.editReply({
          embeds: [EmbedBuilder.from(msgEmbed).setDescription(`Author set to:\`${author.name}\``)],
        });
      }
    });

    collector.on("collect", (m) => {
      if (m.content.length >= 256) {
        return error(interaction, "**Author is too long**", m);
      }

      author = m.mentions.users.first();

      interaction.editReply({
        embeds: [EmbedBuilder.from(msgEmbed).setDescription(`Author set to: \`${author.username}\``)],
      });

      modifiedEmbed = EmbedBuilder.from(embeds[1]).setAuthor({
        name: `${author.username}`,
        iconURL: author.displayAvatarURL({
          dynamic: true,
          size: 512,
        }),
      });

      interaction.message
        .edit({
          embeds: [authorEmbed, modifiedEmbed],
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
