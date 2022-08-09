const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

const embeds = {
  colorEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Editing color`)
    .setDescription(`**to Set:** \`send a hex color code in chat\``),
  titleEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Editing title`)
    .setDescription(`**to Set:** \`send a message in chat\``),
  urlEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Editing url`)
    .setDescription(`**to Set:** \`send a url in chat\``),
  authorEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Editing author`)
    .setDescription(`**to Set:** \`tag a user\``),
  descriptionEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Editing description`)
    .setDescription(`**to Set:** \`send a message in chat\``),
  thumbnailEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Editing thumbnail`)
    .setDescription(`**to Set:** \`Send a [DIRECT] image link in chat\``),
  imageEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Editing image`)
    .setDescription(`**to Set:** \`Send a [DIRECT] image link in chat\``),
  footerEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Editing footer`)
    .setDescription(`**to Set:** \`send a message in chat\``),
  fieldEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Deleting fields`)
    .setDescription(`**to Delete:** \`type index number in chat"\``),
};

module.exports.error = function (interaction, error, message = null) {
  const embed = new EmbedBuilder().setColor("DarkRed").setDescription(` **${error}**`);

  return message
    ? interaction.editReply({ embeds: [embed] }).then(() => setTimeout(() => message.delete(), 1000))
    : interaction.reply({ embeds: [embed], ephemeral: true });
};

module.exports.buttons = function (client, interaction, collector, type = null) {
  const { colorEmbed, authorEmbed, fieldEmbed } = embeds;
  const { guild } = interaction;
  // embeds
  const baseEmbeds = interaction.message.embeds;
  let modifiedEmbed = baseEmbeds[1];
  let msgEmbed = new EmbedBuilder().setColor("F4D58D");

  //components
  const rows = interaction.message.components;

  // define buttons
  const cancel_button = new ButtonBuilder().setCustomId("cancel").setStyle(ButtonStyle.Secondary).setLabel("cancel");
  const random_button = new ButtonBuilder().setCustomId("random").setStyle(ButtonStyle.Secondary).setLabel("random");
  const bot_button = new ButtonBuilder().setCustomId("bot").setStyle(ButtonStyle.Secondary).setLabel("bot");
  const guild_button = new ButtonBuilder().setCustomId("guild").setStyle(ButtonStyle.Secondary).setLabel("guild");
  const index_button = new ButtonBuilder().setCustomId("sindex").setStyle(ButtonStyle.Secondary).setLabel("Show Index");

  // util buttons
  let buttonRow = new ActionRowBuilder().addComponents(cancel_button);

  switch (type) {
    case null:
      editMessage();
      break;
    case "color":
      buttonRow.addComponents(random_button);
      editMessage();
      break;
    case "author":
      buttonRow.addComponents(bot_button, guild_button);
      editMessage();
      break;
    case "delete":
      buttonRow.addComponents(index_button);
      editMessage();
      break;
  }

  const buttonFilter = (u) => u.user.id === interaction.user.id;
  buttonCollector = interaction.message.createMessageComponentCollector({
    filter: buttonFilter,
  });

  // wrap in function
  function editMessage() {
    interaction.message.edit({
      components: [buttonRow],
    });
  }

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

  buttonCollector.on("collect", (btnInt) => {
    // if cancel button is pressed
    if (btnInt.component.customId === "cancel") {
      // btnInt
      //   .reply({ embeds: [new EmbedBuilder().setColor("F4D58D").setDescription("**Canceled**")] })
      //   .then(() => setTimeout(() => btnInt.deleteReply(), 1000));
      btnInt.deferUpdate();
      interaction.message
        .edit({
          embeds: [baseEmbeds[0], interaction.message.embeds[1]],
          components: rows,
        })
        .then(interaction.deleteReply());

      buttonCollector.stop();
      collector.stop();
    }

    // if random button is pressed
    if (btnInt.component.customId === "random") {
      btnInt.deferUpdate();

      let letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }

      modifiedEmbed = EmbedBuilder.from(baseEmbeds[1]).setColor(color);

      interaction.message.edit({
        embeds: [colorEmbed, modifiedEmbed],
      });
      interaction.editReply({
        embeds: [EmbedBuilder.from(msgEmbed).setDescription(`Color set to:\`${color}\``).setColor(`${color}`)],
      });
    }

    // if bot button is pressed
    if (btnInt.component.customId === "bot") {
      btnInt.deferUpdate();

      author = {
        name: `${client.user.username}`,
        iconURL: client.user.displayAvatarURL({
          dynamic: true,
          size: 512,
        }),
      };

      modifiedEmbed = EmbedBuilder.from(baseEmbeds[1]).setAuthor(author);

      interaction.message.edit({
        embeds: [authorEmbed, modifiedEmbed],
      });
      interaction.editReply({
        embeds: [EmbedBuilder.from(msgEmbed).setDescription(`Author set to:\`${author.name}\``)],
      });
    }

    // if guild button is pressed
    if (btnInt.component.customId === "guild") {
      btnInt.deferUpdate();

      author = {
        name: `${guild.name}`,
        iconURL: guild.iconURL({
          dynamic: true,
          size: 512,
        }),
      };

      modifiedEmbed = EmbedBuilder.from(baseEmbeds[1]).setAuthor(author);

      interaction.message.edit({
        embeds: [authorEmbed, modifiedEmbed],
      });
      interaction.editReply({
        embeds: [EmbedBuilder.from(msgEmbed).setDescription(`Author set to:\`${author.name}\``)],
      });
    }
    // if index button is pressed
    if (btnInt.component.customId === "sindex") {
      btnInt.deferUpdate();
      return showIndex(fieldEmbed, interaction.message.embeds[1]);
    }
  });
};

module.exports.embeds = embeds;
