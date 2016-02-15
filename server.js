var express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	hbs = require("hbs"),
	mongoose = require("mongoose"),
	cookieParser = require("cookie-parser"),
	session = require("express-session"),
	flash = require("express-flash"),
	passport = require("passport"),
	LocalStrategy = require("passport-local").Strategy;

require('dotenv').load();
var Yelp = require("yelp");

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static(__dirname + "/public"));

app.set("view engine", "hbs");

hbs.registerPartials(__dirname + "/views/partials");

mongoose.connect(
	process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	"mongodb://localhost/vfood-app");

var User = require("./models/user"),
		Review = require("./models/review");
var description = require("./public/datas/description");

// middleware for auth
app.use(cookieParser());
app.use(session({
	secret: "supersecretkey",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//send flash messages
app.use(flash());

// passport config
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//sign up page
app.get("/", function(req, res) {
	if (req.user) {
		res.redirect("/home");
	} else {
		res.render("signup", {
			user: req.user,
			errorMessage: req.flash("signupError")
		});
	}
});

//save new user to db

app.post("/", function(req, res) {
	//prevent logged in user to sign up again
	if (req.user) {
		res.redirect("/home");
	} else {
		User.register(new User({
				username: req.body.username
			}), req.body.password,
			function(err, newUser) {
				if (err) {
					req.flash("signupError", err.message);
					res.redirect("/");
				} else {
					passport.authenticate('local')(req, res, function() {
						res.redirect("/home");
					});
				}
			}
		);
	}
});

//show login view
app.get("/login", function(req, res) {
	//prevent login user to see login page again
	if (req.user) {
		res.redirect("/home");
	} else {
		res.render("login", {
			user: req.user
		});
	}
});

// //login user class tutorial way
// app.post("/login", passport.authenticate("local"), function(req, res) {
// 	res.redirect("/home");
// });

//another way to validate logging user
app.post('/login',
	passport.authenticate('local', {
		successRedirect: '/home',
		failureRedirect: '/login',
		failureFlash: true
	}));



//logout user
app.get("/logout", function(req, res) {
	req.logout();
	res.redirect("/home");
});

//home page round
app.get("/home", function(req, res) {
	res.render("index", {
		user: req.user
	});
});

//profile page round
app.get("/profile", function(req, res) {
	if (req.user) {
		res.render("profile", {
			user: req.user
		});
	} else {
		res.redirect("/");
	}
});

//import yelp API needed keys
var yelp = new Yelp({
	consumer_key: process.env.my_consumer_key,
	consumer_secret: process.env.my_consumer_secret,
	token: process.env.my_token,
	token_secret: process.env.my_token_secret
});

//different get request for different disdes
description.forEach(function(x) {
	var dish = x.name.toLowerCase();
	app.get("/api/" + dish.replace(/\s/g, ""), function(req, res) {
		yelp.search({
				term: dish,
				location: req.query.location,
				sort: 0,
				category_filter: "vietnamese",
				radius_filter: 10000,
				limit: 10
			})
			.then(function(data) {
				res.json({
					restaurants: data.businesses,
					lnglat: data.region.center
				});
			})
			.catch(function(err) {
				console.error(err);
			});
	});
});

//get all dishes descriptions
app.get("/api/description", function(req, res) {
	res.json({
		dishes: description
	});
});

//reviews round
app.get("/review", function(req, res) {
	//prevent non logged in user to see reviews page
	if (req.user) {
		res.render("review", {
			user: req.user
		});
	} else {
		res.redirect("/");
	}
});

//get all reviews
app.get("/api/reviews", function(req, res) {
	Review.find()
		.populate("author")
		.exec(function(err, allReviews) {
			if (err) {
				res.status(500).json({
					error: err.message
				});
			} else {
				res.json({
					reviews: allReviews
				});
			}
		});
});

//edit review route
app.put("/api/reviews/:id", function(req, res) {
	if (req.user) {
		var id = req.params.id;
		//find current logged in user who about to edit
		User.findOne({
			_id: req.user._id
		}, function(err, foundUser) {
			var userReviews = foundUser.reviews;
			//make sure the id of review belong to user
			if (userReviews.indexOf(id) > -1) {
				Review.findOne({
					_id: id
				}, function(err, foundReview) {
					foundReview.business = req.body.business;
					foundReview.address1 = req.body.address1;
					foundReview.address2 = req.body.address2;
					foundReview.dateVisited = req.body.dateVisited;
					foundReview.thought = req.body.thought;
					foundReview.written = req.body.written;
					foundReview.save(function(err, editedReview) {
						res.json(editedReview);
						req.user.save();
					});
				});
			}
		});
	}
});

app.post("/api/reviews", function(req, res) {
	//only allow user to do review part
	if (req.user) {
		var newReview = new Review(req.body);
		newReview.author = req.user._id;
		// newReview.dateVisited = (new Date()).toDateString();
		newReview.save(function(err, savedReview) {
			if (err) {
				res.status(500).json({
					error: err.message
				});
			} else {
				//save review to user review collection
				req.user.reviews.unshift(savedReview);
				//update user
				req.user.save();
				res.json(savedReview);
			}
		});
	} else {
		res.status(401).json({
			error: "Unauthorized"
		});
	}
});

//listen to port 3000
var server = app.listen(process.env.PORT || 3000, function() {
	console.log("I'm listening");
});