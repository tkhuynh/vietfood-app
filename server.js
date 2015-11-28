var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    hbs = require("hbs"),
    mongoose = require("mongoose"),
    cookieParser = require("cookie-parser"),
    session = require("express-session"),
    passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy;

require('dotenv').load();
var Yelp = require("yelp");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

app.set("view engine", "hbs");

hbs.registerPartials(__dirname + "/views/partials");

//hello word test
app.get("/", function (req, res) {
	res.render("index");
});

//import yelp API needed keys
var yelp = new Yelp({
  consumer_key: process.env.my_consumer_key,
  consumer_secret: process.env.my_consumer_secret,
  token: process.env.my_token,
  token_secret: process.env.my_token_secret
});
//different get request for different disdes
var dishes = ["banh mi", "bun bo hue", "pho", "bun thit nuong", "bo luc lac", "cha gio", "goi cuon", "cafe sua da", "bun rieu", "che ba mau", "goi du du", "com tam bi suon cha", "hu tieu", "bo kho", "banh xeo"];

dishes.forEach(function (dish) {
	app.get("/api/" + dish.replace(/\s/g,""), function (req, res) {
		yelp.search({ term: dish, location: "San Francisco, CA", sort: 0, category_filter: "vietnamese", radius_filter: 10000, limit: 10})
			.then(function (data) {
				res.json({restaurants : data.businesses});
			})
				.catch(function (err) {
					console.error(err);
				});
	});
});

//listen to port 3000
var server = app.listen(process.env.PORT || 3000, function () {
	console.log("I'm listening");
});