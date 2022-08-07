
function loadButtons(client) {
  const ascii = require("ascii-table");
  const fs = require("fs");
  const table = new ascii().setHeading("Button", "Status");
  const folders = fs.readdirSync("./Buttons");
  for (const folder of folders) {
    const files = fs.readdirSync(`./Buttons/${folder}`).filter((file) => file.endsWith(".js"));
    for (const file of files) {
      const button = require(`../Buttons/${folder}/${file}`);
      client.buttons.set(button.id, button);
      table.addRow(file, "✅");
      continue;
    }
  }
  return console.log(table.toString(), "\nButtons Loaded.");
}

module.exports = { loadButtons };
