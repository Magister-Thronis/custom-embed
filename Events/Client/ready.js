const { database } = require("../../config.json");
const { Client } = require("discord.js");
const mongoose = require("mongoose");

module.exports = {
  name: "ready",
  once: true,
  /**
   *
   * @param {Client} client
   */
  execute(client) {
    console.log(`Client is now logged in as ${client.user.username}`);

    // check for DB connection
    if (!database) return;
    // connect to Db
    mongoose
      .connect(database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("The client is now connected to the database!");
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
