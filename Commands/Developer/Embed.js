const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const db = require("../../schemas/embed");

function fetch(channel, msg) {
  return new Promise((resolve, reject) => {
    channel.messages
      .fetch(msg)
      .then((message) => resolve(message))
      .catch((err) => reject(err));
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Create a custom message embed")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("new")
        .setDescription("embed tools")
        .addChannelOption((options) =>
          options.setName("channel").setDescription("channel to send the embed").setRequired(true)
        )
        .addStringOption((options) => options.setName("message").setDescription("optional message to send"))
    )
    .addSubcommandGroup((subcommandgroup) =>
      subcommandgroup
        .setName("setup")
        .setDescription("embed setup")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add_category")
            .setDescription("add a template category")
            .addStringOption((options) =>
              options.setName("name").setDescription("name of the category").setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove_category")
            .setDescription("remove a template category")
            .addStringOption((options) =>
              options
                .setName("name")
                .setDescription("select category to remove")
                .setAutocomplete(true)
                .setRequired(true)
            )
        )
    )
    .addSubcommandGroup((subcommandgroup) =>
      subcommandgroup
        .setName("tools")
        .setDescription("embed tools")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("select_from_template")
            .setDescription("embed tools")
            .addStringOption((options) =>
              options
                .setName("category")
                .setDescription("category to select from")
                .setAutocomplete(true)
                .setRequired(true)
            )
            .addChannelOption((options) =>
              options.setName("channel").setDescription("channel to send the embed").setRequired(true)
            )
            .addStringOption((options) => options.setName("message").setDescription("optional message to send"))
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("save_as_template")
            .setDescription("embed tools")
            .addStringOption((options) =>
              options.setName("category").setDescription("category to save to").setAutocomplete(true).setRequired(true)
            )
            .addStringOption((options) =>
              options.setName("name").setDescription("name of the template").setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("edit_embed")
            .setDescription("embed tools")
            .addChannelOption((options) =>
              options.setName("channel").setDescription("message channel").setRequired(true)
            )
            .addStringOption((options) =>
              options.setName("message-id").setDescription("enter message ID").setRequired(true)
            )
        )
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */

  async autocomplete(interaction, client) {
    const data = await db.findOne({ _id: interaction.guild.id });
    const categories = data.categories;
    const choices = categories.map((category) => category.name);
    const focusedValue = interaction.options.getFocused();
    const filtered = choices.filter((choice) => choice.toLowerCase().startsWith(focusedValue));
    await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
  },

  async execute(interaction, client) {
    const { guild, channel, user } = interaction;

    const action = interaction.options.getSubcommand();
    const messageId = interaction.options.getString("message-id");
    const message = interaction.options.getString("message");
    const messageChannel = interaction.options.getChannel("channel");
    let interactionMessage = null;

    const error = client.tools.error;
    const uid = user.id;

    // find doc or create new one
    let data = await db.findOne({ _id: guild.id });
    if (!data) {
      data = new db({
        _id: guild.id,
      });
      await data.save();
    }

    // find userObject or create new one
    let userObject = data.users.find((u) => u.userId === uid);
    if (!userObject) {
      userObject = {
        userId: uid,
      };
      data.users.push(userObject);
      await data.save();
    }

    // setup components

    const ROW_0 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Set Color").setCustomId("CEcolor").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setLabel("Set Title").setCustomId("CEtitle").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setLabel("Set URL").setCustomId("CEurl").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setLabel("Set Author").setCustomId("CEauthor").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setLabel("Set Description").setCustomId("CEdescription").setStyle(ButtonStyle.Primary)
    );

    const ROW_1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Set Thumbnail").setCustomId("CEthumbnail").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setLabel("Add Field").setCustomId("CEfields").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setLabel("Delete Field").setCustomId("CEfields_delete").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setLabel("Set Image").setCustomId("CEimage").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setLabel("Set Footer").setCustomId("CEfooter").setStyle(ButtonStyle.Primary)
    );

    const ROW_2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Send").setCustomId("CEsend").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setLabel("cancel").setCustomId("CEcancel").setStyle(ButtonStyle.Primary)
    );

    const rows = [ROW_0, ROW_1, ROW_2];

    // setup embeds
    let CUSTOM_EMBED = new EmbedBuilder().setDescription("\u200b").setColor("F4D58D");

    let BASE_EMBED = new EmbedBuilder()
      .setColor("F4D58D")
      .setAuthor({
        name: `${guild.name} | Embed Creator`,
        iconURL: guild.iconURL({
          dynamic: true,
          size: 512,
        }),
      })
      .setDescription(
        `
      **Use buttons to create a customized embed**
      ㅤ
      `
      )
      .setFooter({ text: `Changes will be reflected on the embed below` });

    switch (action) {
      case "new": // start with a fresh embed
        interactionMessage = await interaction.reply({
          embeds: [BASE_EMBED, CUSTOM_EMBED],
          components: rows,
          fetchReply: true,
        });

        userObject.sendChannel = messageChannel.id;
        userObject.sendMessage = message || "";
        userObject.interactionMessage = interactionMessage.id;
        userObject.interactionChannel = interactionMessage.channel.id;
        data.markModified("users");
        await data.save();
        break;
      case "add_category": // add a category
        const categoryName = interaction.options.getString("name");
        data.categories.push({ name: categoryName, templates: [] });
        data.markModified("categories");
        await data.save();
        interaction.reply({ content: `Added category ${categoryName}`, ephemeral: true });
        break;
      case "remove_category": // remove a category
        const categoryNameToRemove = interaction.options.getString("name");
        data.categories = data.categories.filter((c) => c.name !== categoryNameToRemove);
        data.markModified("categories");
        await data.save();
        interaction.reply({ content: `Removed category ${categoryNameToRemove}`, ephemeral: true });
        break;

      case "save_as_template": // save embed as template
        const categoryNameToSave = interaction.options.getString("category");

        if (!data.categories.find((c) => c.name === categoryNameToSave)) {
          return error(interaction, `Category \`${categoryNameToSave}\` not found`);
        }

        const templateName = interaction.options.getString("name");

        if (!userObject.interactionChannel && !userObject.interactionMessage) {
          return error(interaction, "You haven't created an embed yet");
        }

        const chan = client.channels.cache.get(userObject.interactionChannel);

        saveMessage = await fetch(chan, userObject.interactionMessage);

        const embed_Data = saveMessage.embeds[1];

        const JSON_data = JSON.stringify(embed_Data);

        const template = {
          name: templateName,
          embed: JSON_data,
        };
        const category = data.categories.find((c) => c.name === categoryNameToSave);
        category.templates.push(template);
        data.markModified("categories");
        await data.save();
        interaction.reply({ content: `Saved template \`${templateName}\``, ephemeral: true });
        break;

      case "select_from_template": // use a stored embed as a template
        if (userObject.interactionChannel || userObject.interactionMessage) {
          return error(interaction, "You already have an embed in progress");
        }
        const categoryNameToUse = interaction.options.getString("category");
        userObject.sendChannel = messageChannel.id;
        userObject.sendMessage = message || "";
        data.markModified("users");
        await data.save();

        // get index of categoryNameToUse
        const categoryIndex = data.categories.findIndex((c) => c.name === categoryNameToUse);

        if (!data.categories.find((c) => c.name === categoryNameToUse)) {
          return error(interaction, `Category \`${categoryNameToUse}\` not found`);
        }

        // check length of data.categories[categoryNameToUse].templates
        if (data.categories[categoryIndex].templates.length === 0) {
          return error(interaction, `No templates found in category \`${categoryNameToUse}\``);
        }

        const infoEmbeds = [];
        const embeds = [];
        const pages = {};

        // generate infoEmbeds  based on the elements in data.categories[categoryIndex] set the description to the name of the template
        for (let i = 0; i < data.categories[categoryIndex].templates.length; i++) {
          const template = data.categories[categoryIndex].templates[i];
          const infoEmbed = {
            type: "rich",
            description: `
            **category:** \`${categoryNameToUse}\`
            **name:** \`${template.name}\`
            `,
            color: 10154743,
            author: {
              name: `${guild.name} | Embed Templates`,
              icon_url: guild.iconURL({
                dynamic: true,
                size: 512,
              }),
            },
          };
          infoEmbeds.push(infoEmbed);
        }

        // generate embeds based on the elements in data.categories[categoryNameToUse].templates
        for (let i = 0; i < data.categories[categoryIndex].templates.length; i++) {
          const template = data.categories[categoryIndex].templates[i];
          const embed = JSON.parse(template.embed);
          embeds.push(embed);
        }

        const getRow = (id) => {
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("prev_embed")
              .setStyle(ButtonStyle.Primary)
              .setEmoji("⏮")
              .setDisabled(pages[id] === 0),
            new ButtonBuilder()
              .setCustomId("select_embed")
              .setStyle(ButtonStyle.Primary)
              .setEmoji("✅")
              .setLabel(`Select`),
            new ButtonBuilder()
              .setCustomId("delete_embed")
              .setStyle(ButtonStyle.Primary)
              .setEmoji("❌")
              .setLabel("Delete"),
            new ButtonBuilder()
              .setCustomId("next_embed")
              .setStyle(ButtonStyle.Primary)
              .setEmoji("⏭")
              .setDisabled(pages[id] === embeds.length - 1)
          );
          return row;
        };
        const id = user.id;
        pages[id] = pages[id] || 0;

        const infoEmbed = infoEmbeds[pages[id]];
        const embed = embeds[pages[id]];
        let collector;

        const filter = (i) => i.user.id === user.id;
        // const time = 1000 * 60;

        await interaction.reply({
          //ephemeral: true,
          embeds: [infoEmbed, embed],
          components: [getRow(id)],
        });

        collector = channel.createMessageComponentCollector({ filter });

        collector.on("collect", (btnInt) => {
          if (!btnInt) {
            return;
          }

          btnInt.deferUpdate();

          if (
            btnInt.customId !== "prev_embed" &&
            btnInt.customId !== "next_embed" &&
            btnInt.customId !== "select_embed" &&
            btnInt.customId !== "delete_embed"
          ) {
            return;
          }

          if (btnInt.customId === "prev_embed" && pages[id] > 0) {
            --pages[id];
            interaction.editReply({
              embeds: [infoEmbeds[pages[id]], embeds[pages[id]]],
              components: [getRow(id)],
            });
          } else if (btnInt.customId === "next_embed" && pages[id] < embeds.length - 1) {
            ++pages[id];
            interaction.editReply({
              embeds: [infoEmbeds[pages[id]], embeds[pages[id]]],
              components: [getRow(id)],
            });
          }
          if (btnInt.customId === "delete_embed") {
            embeds.splice(pages[id], 1);
            data.categories[categoryIndex].templates.splice(pages[id], 1);
            data.markModified("categories");
            data.save();
            interaction.followUp({ content: `Deleted template`, ephemeral: true });
            if (data.categories[categoryIndex].templates.length < 1) {
              interaction.editReply({
                content: `you have no more templates in this category`,
                embeds: [],
                components: [],
              });
            } else {
              interaction.editReply({
                embeds: [embeds[0]],
                components: [getRow(id)],
              });
            }
          }

          if (btnInt.customId === "select_embed") {
            interaction.deleteReply();
            collector.stop();
          }
        });

        collector.on("end", async () => {
          CUSTOM_EMBED = embeds[pages[id]];
          interactionMessage = await channel.send({ embeds: [BASE_EMBED, CUSTOM_EMBED], components: rows });
          userObject.interactionMessage = interactionMessage.id;
          userObject.interactionChannel = interactionMessage.channel.id;
          data.markModified("users");
          await data.save();
        });

        break;
      case "edit_embed": // edit existing embed
        // find the embed
        const embedMessage = await fetch(messageChannel, messageId);
        if (!embedMessage.embeds[0]) return error(interaction, "No embed found");
        CUSTOM_EMBED = embedMessage.embeds[0];

        interactionMessage = await interaction.reply({
          embeds: [BASE_EMBED, CUSTOM_EMBED],
          components: rows,
          fetchReply: true,
        });

        userObject.sendChannel = messageChannel.id;
        userObject.messageId = messageId;
        userObject.interactionMessage = interactionMessage.id;
        userObject.interactionChannel = interactionMessage.channel.id;
        data.markModified("users");
        await data.save();

        break;
    }
  },
};
