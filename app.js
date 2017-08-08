/* ========================= */
/*        Dependencies       */
/* ========================= */
var express = require("express");           // Framework for Node.js
var request = require("request");           // Package that helps with API requests

var app = express();
app.set("view engine", "ejs");              // So I don't have to specify EJS when rendering files


/* ========================= */
/*       Routing Methods     */
/* ========================= */

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server is running properly, Bryan. *Winky face*");
});

app.get("/", function(req, res){
    res.render("index"); 
});

app.get("/results", function(req, res){
    var bnetID = req.query.bnetID;
    var region = req.query.region;
    
    bnetID = bnetID.replace("#", "-");

    var url = "http://ow-api.herokuapp.com/profile/pc/"+ region +"/"+bnetID;
    
    request(url, function(err, response, body){
        if(err){
            console.log(err);
        } else {
            var data = JSON.parse(body);
            res.render("results", {data: data});
        }
    })
})