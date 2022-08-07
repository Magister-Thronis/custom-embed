const { EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  id: "CEfields_delete",
  permission: PermissionFlagsBits.Administrator,

  async execute(interaction, client) {
    const { guild } = interaction;

    // embeds
    const embeds = interaction.message.embeds;
    let modifiedEmbed = EmbedBuilder.from(embeds[1]);

    //components
    const rows = interaction.message.components;

    // utilities
    const error = client.tools.error;

    let num = 0;

    // show index of fields function
    async function showIndex(embed0, embed1) {
      const data = embed1.data.fields.map((field) => {
        return {
          name: `\`${num++}\`` + " " + field.name,
          value: field.value,
          inline: field.inline,
        };
      });
      embed1 = EmbedBuilder.from(embed1).setFields(data);
      await interaction.message.edit({ embeds: [embed0, embed1] });
      num = 0;
    }

    const FieldEmbed = new EmbedBuilder().setColor("F4D58D").setAuthor({
      name: `${guild.name} | Deleting fields`,
      iconURL: guild.iconURL({
        dynamic: true,
        size: 512,
      }),
    }).setDescription(`
      **to Delete:** \`type index number in chat"\`
      **to End:** \`type "stop"\`
      `);

    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
    });

    // util buttons --------------------------------------------------------------
    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("cancel").setStyle(ButtonStyle.Secondary).setLabel("cancel"),
      new ButtonBuilder().setCustomId("sindex").setStyle(ButtonStyle.Secondary).setLabel("Show Index")
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
      if (btnInt.component.customId === "sindex") {
        btnInt.deferUpdate();
        return showIndex(FieldEmbed, modifiedEmbed);
      }
    });

    let msgEmbed = new EmbedBuilder().setColor("F4D58D");

    interaction.reply({
      embeds: [msgEmbed.setDescription("Enter the field index number:")],
    });

    collector.on("collect", (m) => {
      let index = parseInt(m.content);

      if (isNaN(index)) {
        return error(interaction, "Index must be a number", m);
      }
      if (index > 25 || index < 0) {
        return error(interaction, "Index number must be between 0 - 25", m);
      }
      if (!modifiedEmbed.data.fields[index]) {
        return error(interaction, `Index${index} doesn't exist`, m);
      }

      interaction.editReply({
        embeds: [msgEmbed.setDescription(`Field\`${index}\` deleted!`)],
      });

      interaction.message
        .edit({
          embeds: [FieldEmbed, modifiedEmbed.spliceFields(index, 1)],
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
