var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    hbs = require("hbs"),
    mongoose = require("mongoose"),
    cookieParser = require("cookie-parser"),
    session = require("express-session"),
    passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    Yelp = require("yelp");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

app.set("view engine", "hbs");

hbs.registerPartials(__dirname + "/views/partials");

//hello word test
app.get("/", function (req, res) {
	res.send("hello world");
});

//listen to port 3000
var server = app.listen(process.env.PORT || 3000, function () {
	console.log("I'm listening");
});