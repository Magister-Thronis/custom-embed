async function loadCommands(client) {
  const { loadFiles } = require("../functions/loadfiles");
  const ascii = require("ascii-table");
  const table = new ascii().setHeading("Commands", "Status");

  await client.commands.clear();

  let commandsArray = [];
  let developerArray = [];

  const Files = await loadFiles("Commands");

  Files.forEach((file) => {
    const command = require(file);
    client.commands.set(command.data.name, command);

    if (command.developer) developerArray.push(command.data.toJSON());
    else commandsArray.push(command.data.toJSON());

    table.addRow(command.data.name, "🟩");
  });

  client.application.commands.set(commandsArray);

  const developerGuild = client.guilds.cache.get(client.config.developerGuild);
  developerGuild.commands.set(developerArray);
  return console.log(table.toString(), "\n Loaded Commands");
}

module.exports = { loadCommands };
