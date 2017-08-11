// This is a player scheme for Mongoose to know what information to hold per user/request
var mongoose = require("mongoose");

var playerSchema = mongoose.Schema({
    bnetID: String,
    username: String,
    level: String,
    currentHours: String,
    competitiveRank: String,
    rankImage: String
});

module.exports = mongoose.model("Player", playerSchema);