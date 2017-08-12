/* ========================= */
/*        Dependencies       */
/* ========================= */
var express  = require("express");           // Framework for Node.js
var request  = require("request");           // Package that helps with API requests
var mongoose = require("mongoose");          // A way to connect to our DataBase
var Player   = require("./models/player");

var app = express();
app.set("view engine", "ejs");              // So I don't have to specify EJS when rendering files


/* ========================= */
/*           Config          */
/* ========================= */

// Database connection
mongoose.connect("mongodb://localhost/owstats");
mongoose.Promise = global.Promise;

/* ========================= */
/*       Routing Methods     */
/* ========================= */
// Listen in on the server, to see if it's properly running
app.listen(3000, function(){
    console.log("Server is running properly, Bryan. *Winky face*");
});

// Make a GET request to the root page (index)
app.get("/", function(req, res){
    res.render("index"); 
});

// Make a GET request to the /results page (When submit is pressed)
app.get("/results", function(req, res){
    // Retrieve bnetID and REGION from the FORM
    var bnetID = req.query.bnetID;
    var region = req.query.region;
    
    // Replace the # with a -
    bnetID = bnetID.replace("#", "-");
    
    // Create the query string
    var url = "http://ow-api.herokuapp.com/profile/pc/"+ region +"/"+bnetID;
    
    // Make the API request
    request(url, function(err, response, body){
        if(body === "Not Found"){
            res.render("error");
        } else {
            // If everything works out nicely, parse the JSON data so it turns into an object we can access
            var playerData = JSON.parse(body);
            // Call a function that'll simplify that JSON data to the data we WANT for our Player Schema (to put in our Database)
            playerData = findImportantData(bnetID, playerData);
            // Next CHECK if the user already exists in DB, if they are UPDATE the items, if not, create a new player in the DB
            checkIfExists(bnetID, playerData);
            // Past this point, render the playerData
            Player.find().sort({competitiveRank: -1}).exec(function(err, sortedPlayers){
                if(err){
                    console.log(err);
                } else {
                    res.render("results", {data: playerData, players:sortedPlayers});
                }
            });
        }
    })
});

/* ========================= */
/*          Functions        */
/* ========================= */

// Check if player already exists in the DB
function checkIfExists(bnetID, playerData) {
    Player.findOne({bnetID: bnetID}, function(err, foundPlayer){
        if(err){
            console.log(err);
        } else {
            if(!foundPlayer){
                console.log("Player was not found");
                createPlayer(playerData);
            } else {
                console.log("Player was found");
                updatePlayer(bnetID, playerData);
            }
        }
    })
}

// If player already exists, update their data
function updatePlayer(bnetID, playerData){
    Player.findOneAndUpdate({bnetID: bnetID}, playerData, function(err){
        if(err){
            console.log(err);  
        } else {
            console.log(bnetID+"'s data has been updated");
        }
    });
}
// If user does not exit, create them and put them in the DB
function createPlayer(playerData){
    Player.create(playerData, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            console.log("Player " +playerData.bnetID+ " was added to the DB");
        }
    });
}

// Find all the important stuff to cater to the Player Schema
function findImportantData(bnetID, playerData) {
    var goodies = {
        bnetID: bnetID,
        username: playerData["username"],
        level: playerData["level"],
        currentHours: playerData["playtime"].competitive,
        competitiveRank: playerData["competitive"].rank,
        rankImage: playerData["competitive"].rank_img
    }
    return goodies;
}