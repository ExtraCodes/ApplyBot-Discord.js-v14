const mongoose = require('mongoose');

module.exports = mongoose.model(
  "apply",
  new mongoose.Schema({
    guildId: String,
    support: String,
    channel: String,
    accepte: String,
    questions: Array,
  })
);