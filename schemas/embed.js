const { Schema, model } = require("mongoose");

module.exports = model(
  "embed",
  new Schema({
    _id: String,
    users: [Object],
    categories: [Object],
  })
);
