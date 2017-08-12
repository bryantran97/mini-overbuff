// This is a player scheme for Mongoose to know what information to hold per user/request
var mongoose = require("mongoose");

var playerSchema = mongoose.Schema({
    bnetID: String,
    username: String,
    level: Number,
    currentHours: String,
    competitiveRank: Number,
    rankImage: String
});

module.exports = mongoose.model("Player", playerSchema);