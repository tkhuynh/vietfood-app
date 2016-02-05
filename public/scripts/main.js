$(function() {	
	var currentLocation = localStorage.getItem("zipCode");
	var currentLongitude = Number(localStorage.getItem("longitude"));
	var currentLatitude = Number(localStorage.getItem("latitude"));
	if (!currentLocation) {
		currentLocation = "San Francisco";
	}
	console.log(currentLocation, typeof currentLongitude, currentLatitude);


	var commonDishes = ["banh mi", "bun bo hue", "pho", "bun thit nuong", "bo luc lac", "cha gio", "goi cuon", "cafe sua da", "bun rieu", "che ba mau", "goi du du", "com tam bi suon cha", "hu tieu nam vang", "bo kho", "banh xeo"].sort();
	var dried_non_noddle = ["Bo Luc Lac", "Com Tam Bi Suon Cha"];
	var dried_noddle = ["Bun Thit Nuong"];
	var spicy_soup = ["Bun Bo Hue"];
	var non_spicy_soup = ["Pho", "Bun Rieu", "Hu Tieu Nam Vang", "Bo Kho"];
	var appertizer = ["Cha Gio", "Goi Cuon", "Goi Du Du"];
	var non_appertizer = ["Banh Mi", "Banh Xeo"];
	var drink = ["Che Ba Mau", "Cafe Sua Da"];
	commonDishes.forEach(function(dish) {
		var capitalize = dish.replace(/^.|\s./g, function(x) {
			return x.toUpperCase();
		});
		$("#dropdown-list").append("<li><a href='#'>" + capitalize + "</a></li>");
	});
	var createMap = function() {
		map = new google.maps.Map(document.getElementById('map'), {
			center: {
				lat: currentLatitude,
				lng: currentLongitude
			},
			zoom: 12
		});
	};
	//helper functions
	function restaurantsSellThisDish(dish, keyword) {
		$("#answerMe").hide();
		$("#map").show();
		$.get("/api/" + dish, {
			location: currentLocation
		}, function(data) {
			$("#result, .goBack, .goBack2").show();
			var restaurants = data.restaurants;
			$("#restaurantList").empty();
			var restaurantHtml = template2({
				restaurants: restaurants
			});
			console.log(restaurants);
			$("#restaurantList").append(restaurantHtml);
			restaurants.forEach(function(restaurant) {
				var contentString = '<div id="content">' +
					'<div id="siteNo(tice">' +
					'</div>' +
					'<h5 id="firstHeading" class="firstHeading">' + restaurant.name + '</h5>' +
					'</div>';
				var infowindow = new google.maps.InfoWindow({
					content: contentString
				});
				var latitude = restaurant.location.coordinate.latitude;
				var longitude = restaurant.location.coordinate.longitude;
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(latitude, longitude),
					map: map,
					title: restaurant.name,
					icon: '/images/restaurant.png'
				});

				marker.addListener('click', function(e) {
					infowindow.close();
					infowindow.setContent(contentString);
					infowindow.open(map, marker);
				});
			});
		});

		//get description of dish from manually built api then append to the page
		$.get("/api/description", function(data) {
			var dishes = data.dishes;
			var foundDish;
			dishes.forEach(function(dish) {
				if (dish.name.toLowerCase() == keyword) {
					foundDish = dish;
				}
			});
			$("#foodDescription").empty();
			var descriptionHtml = template1({
				dish: foundDish
			});
			$description.append(descriptionHtml);
		});
		createMap();
	}
	//for food description
	var $description = $("#foodDescription");
	var source1 = $("#description-template").html();
	var template1 = Handlebars.compile(source1);

	// for restaurants result
	var source2 = $("#restaurant-template").html();
	var template2 = Handlebars.compile(source2);

	function hidden() {
		$("#map").hide();
		$("#foodDescription").empty();
		$("#restaurantList").empty();
	}

	//Top Dishes option
	$(".topOption").click(function() {
		$("#panel").slideToggle("slow");
		$("#option-holder").toggle();
	});

	$("#panel").on("click", "img", function(event) {
		event.preventDefault();
		$("#goBack-holder").html("<span class='goBack'>X</span>");
		var keyword = $(this).attr("id").replace(/_/g, " ");
		var dish = keyword.replace(/\s/g, "");
		restaurantsSellThisDish(dish, keyword);
		$("#result, .goBack").show();
		$("#panel").toggle();
		$(".goBack").click(function() {
			$("#panel, #picsHolder2").hide();
			$("#panel").show();
			hidden();
			$(this).hide();
		});

		$("#restaurantList").on("click", ".chosen", function(event) {
			$("#panel").hide();
			$("#panel").hide();
			$("#panel").show();
			hidden();
			$(".goBack").hide();
			event.preventDefault();
			var name = $(this).attr("id");
			var address1 = $(this).next().text();
			var address2 = $(this).next().next().text();
			var reviewNeedToBeWritten = {
				business: name,
				address1: address1,
				address2: address2,
				thought: "Please write a review for your last visit.",
				written: false,
				dateVisited: (new Date()).toDateString()
			};
			//save review to database
			$.post("/api/reviews", reviewNeedToBeWritten);
			$("#reminder").show();
			$("html, body").animate({
				scrollTop: 0
			});
			$("body").on("click", ".ok", function() {
				$("#reminder").hide();
				$("#option-holder").show();
			});
		});

	});

	//helper function
	//generation random number from 0 to less than array.length
	function randomNum(array) {
		return Math.floor(Math.random() * array.length);
	}

	//Random Options Chosen
	$("#random").click(function() {
		$("#goBack-holder").html("<span class='goBack2'>X</span>");
		$("#option-holder").hide();
		$("#answerMe").hide();
		$("#result").show();
		var random = randomNum(commonDishes);
		keyword = commonDishes[random];
		var dish = keyword.replace(/\s/g, "");
		restaurantsSellThisDish(dish, keyword);
		$(".goBack2").click(function() {
			$(this).hide();
			$("#option-holder").show();
			hidden();
		});

		$("#restaurantList").on("click", ".chosen", function(event) {
			hidden();
			event.preventDefault();
			var name = $(this).attr("id");
			var address1 = $(this).next().text();
			var address2 = $(this).next().next().text();
			var reviewNeedToBeWritten = {
				business: name,
				address1: address1,
				address2: address2,
				thought: "Please write a review for your last visit.",
				written: false,
				dateVisited: (new Date()).toDateString()
			};
			//save review to database
			$.post("/api/reviews", reviewNeedToBeWritten);
			$(".goBack2").remove();
			$("#reminder").show();
			$("html, body").animate({
				scrollTop: 0
			});
			$("body").on("click", ".ok", function() {
				$("#reminder").hide();
				$("#option-holder").show();
				hidden();
			});
		});

	});

	//function helper 
	function questionMaker(question, answer1, answer2) {
		$("#question-holder").empty();
		$("#question-holder").append("<div class='question text-center'></div>");
		$(".question").append("<img src='/images/guru.png' class='img-responsive guru-question'>")
			.append("<h2>" + question + "</h2>")
			.append("<button type='button' class='btn btn-danger left'>" + answer1 + "</button>")
			.append("<button type='button' class='btn btn-danger right'>" + answer2 + "</button>");
	}

	//helper function 
	function guruChoice(message, category) {
		var random = randomNum(category);
		$("#question-holder").append("<div class='guru-result'</div>");
		$(".guru-result").append("<h2>" + message + "<br>" + category[random] + "</h2>")
			.append("<button type='button' class='btn btn-danger find'>Find Restaurants</button>");
		keyword = category[random].toLowerCase();
		var dish = keyword.replace(/\s/g, "");
		$(".find").click(function() {
			$("#question-holder").empty();
			//add goBack button to result
			$("#goBack-holder").html("<span class='goBack3'>X</span>");
			restaurantsSellThisDish(dish, keyword);
			$("#result").show();
		});
	}

	//Guru Option
	$("#favorite").on("click", function() {
		$("#options1_2_3").hide();
		hidden();

		function answerGuru() {
			$("#question-holder").empty();
			$("#question-holder").hide();
			$(".close").append("<span class='backToMainPage'>X</span>");
			$("#answerMe").show();
			$("#question-holder").show();
			questionMaker("Are You Really Hungry?", "Yes", "No");
			$(".left").click(function() {
				$(this).parent().remove();
				questionMaker("Do You Like Soup or Non-Soup?", "Non-Soup", "Soup");
				$(".left").click(function() {
					$(this).parent().remove();
					questionMaker("Do You Like To Eat Noodle or Non-Noodle?", "Non-Noodle", "Noddle");
					//case 1
					$(".left").click(function() {
						$(this).parent().remove();
						guruChoice("I Think You Should Try", dried_non_noddle);
					});
					//case 2
					$(".right").click(function() {
						$(this).parent().remove();
						guruChoice("I Think You Should Try", dried_noddle);
					});
				});
				$(".right").click(function() {
					$(this).parent().remove();
					questionMaker("Do You Like Spicy Soup or Non Spice Soup?", "Spicy", "Non-Spicy");
					//case 3
					$(".left").click(function() {
						$(this).parent().remove();
						guruChoice("I Think You Should Try", spicy_soup);
					});
					//case 4
					$(".right").click(function() {
						$(this).parent().remove();
						guruChoice("I Think You Should Try", non_spicy_soup);
					});
				});
			});
			$(".right").click(function() {
				$(this).parent().remove();
				questionMaker("Do You Just Like Appertizer or Sandwich?", "Appertizer", "Sandwich");
				//case 5
				$(".left").click(function() {
					$(this).parent().remove();
					guruChoice("I Think You Should Try", appertizer);
				});
				//case 6
				$(".right").click(function() {
					$(this).parent().remove();
					guruChoice("I Think You Should Try", non_appertizer);
				});
			});
		}
		answerGuru();
		$("body").on("click", ".backToMainPage", function() {
			$(this).remove();
			$("#answerMe").hide();
			$("#options1_2_3").show();
		});
		$("body").on("click", ".goBack3", function() {
			$(this).remove();
			$(".backToMainPage").remove();
			hidden();
			answerGuru();
		});
		$("#restaurantList").on("click", ".chosen", function(event) {
			hidden();
			event.preventDefault();
			var name = $(this).attr("id");
			var address1 = $(this).next().text();
			var address2 = $(this).next().next().text();
			var reviewNeedToBeWritten = {
				business: name,
				address1: address1,
				address2: address2,
				thought: "Please write a review for your last visit.",
				written: false,
				dateVisited: (new Date()).toDateString()
			};
			//save review to database
			$.post("/api/reviews", reviewNeedToBeWritten);
			$(".goBack3").remove();
			$("#reminder").show();
			$("html, body").animate({
				scrollTop: 0
			});
			$("body").on("click", ".ok", function() {
				$("#reminder").hide();
				$("#options1_2_3").show();
				hidden();
			});
		});
	});
});