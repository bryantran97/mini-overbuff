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
app.listen(process.env.PORT, process.env.IP, function(){
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
        if(err){
            console.log(err);
        } else {
            // If everything works out nicely, parse the JSON data so it turns into an object we can access
            var playerData = JSON.parse(body);
            // Call a function that'll simplify that JSON data to the data we WANT for our Player Schema (to put in our Database)
            playerData = findImportantData(bnetID, playerData);
            // Next CHECK if the user already exists in DB, if they are UPDATE the items, if not, create a new player in the DB
            checkIfExists(bnetID, playerData);
            
            // Past this point, render the playerData!
            res.render("results", {data: playerData});

        }
    })
});

// Check is user is already in the database
function checkIfExists(bnetID, playerData, next){
    Player.find({"bnetID": bnetID}, function(err, foundPlayer){
       if(err){
           console.log(err);
       } else {
           console.log("Found you!");
       }
    });
    
    // Player.create(playerData, function(err, newlyCreated){
    //     if(err){
    //         console.log(err);
    //     } else {
        
    //     }
    // });
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