$(function() {
	var commonDishes = ["banh mi", "bun bo hue", "pho", "bun thit nuong", "bo luc lac", "cha gio", "goi cuon", "cafe sua da", "bun rieu", "che ba mau", "goi du du", "com tam bi suon cha", "hu tieu nam vang", "bo kho", "banh xeo"].sort();
	var dried_non_noddle = ["Bo Luc Lac", "Com Tam Bi Suon Cha"];
	var dried_noddle = ["Bun Thit Nuong"];
	var spicy_soup = ["Bun Bo Hue"];
	var non_spicy_soup = ["Pho", "Bun Rieu", "Hu Tieu Nam Vang", "Bo Kho"];
	var apertizer = ["Cha Gio", "Goi Cuon", "Goi Du Du"];
	var non_apertizer = ["Banh Mi", "Banh Xeo"];
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
				lat: 37.78,
				lng: -122.44
			},
			zoom: 13
		});
	};
	//helper functions
	function restaurantsSellThisDish(dish, keyword) {
		$("#answerMe").hide();
		$("#map").show();
		$.get("/api/" + dish, function(data) {
			var restaurants = data.restaurants;
			var leftResult = restaurants.slice(0, 5);
			var rightResult = restaurants.slice(-5);
			$("#restaurantList").empty();
			var restaurantHtmlLeft = template2({
				lefts: leftResult
			});
			$("#result, .goBack, .goBack2").show();
			$("#restaurantList").append(restaurantHtmlLeft);
			var restaurantHtmlRight = template2({
				rights: rightResult
			});
			$("#restaurantList").append(restaurantHtmlRight);
			restaurants.forEach(function(restaurant) {
				var contentString = '<div id="content">' +
					'<div id="siteNo(tice">' +
					'</div>' +
					'<h4 id="firstHeading" class="firstHeading">' + restaurant.name + '</h4>' +
					'<div id="bodyContent">' +
					'<p>' + restaurant.location.display_address[0] +
					', ' + restaurant.location.display_address[1] +
					'<br>' + restaurant.location.display_address[2] + '</p>' +
					'</div>' +
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
					icon: 'restaurant.png'
				});
				marker.addListener("click", function() {
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
		$("#result").hide();
		$("#foodDescription").empty();
		$("#restaurantList").empty();
	}

	//Top Dishes option trial
	$(".topOption").click(function() {
		$("#panel").slideToggle("slow");
		$("#lower1, #lower2").toggle();
	});
	$(".topOption2").click(function() {
		$('#picsHolder2').hide();
		$('#picsHolder1').show();
		$("#panel").slideToggle("slow");
		$("#lower1, #lower2").toggle();
	});

	$(".next").click(function() {
		$('#panel #picsHolder1').hide();
		$('#panel #picsHolder2').slideToggle("slow");
	});
	$(".back").click(function() {
		$('#panel #picsHolder2').hide();
		$('#panel #picsHolder1').slideToggle("slow");
	});

	$("#picsHolder1, #picsHolder2").on("click", "img", function(event) {
		event.preventDefault();
		$("#goBack-holder").html("<span class='goBack'>X</span>");
		var picsHolder = $(this).parent().parent().parent();
		var keyword = $(this).attr("id").replace(/_/g, " ");
		var dish = keyword.replace(/\s/g, "");
		restaurantsSellThisDish(dish, keyword);
		$("#result, .goBack").show();
		picsHolder.toggle();
		$(".goBack").click(function() {
			$("#picsHolder1, #picsHolder2").hide();
			picsHolder.show();
			hidden();
			$(this).hide();
		});
	});

	//helper function
	//generation random number from 0 to less than array.length
	function randomNum(array) {
		return Math.floor(Math.random() * array.length);
	}

	//helper function 
	//Random Options Chosen
	$("#random").click(function() {
		$("#goBack-holder").html("<span class='goBack2'>X</span>");
		var currentPosition = $(window).scrollTop() + "px";
		console.log(currentPosition);
		$("#lower1, #lower2").hide();
		$("#answerMe").hide();
		$("#commonDishes").hide();
		$("#result, .goBack2").show();
		var random = randomNum(commonDishes);
		keyword = commonDishes[random];
		var dish = keyword.replace(/\s/g, "");
		restaurantsSellThisDish(dish, keyword);
		$(".goBack2").click(function() {
			$("#lower1, #lower2").show();
			hidden();
			$("html, body").animate({
				scrollTop: currentPosition
			});
		});
	});

	//function helper 
	function questionMaker(question, answer1, answer2) {
		$("#question-holder").append("<div class='question'><h2>" + question + "</h2></div>");
		$(".question").append("<button type='button' class='btn btn-danger left'>" + answer1 + "</button>")
			.append("<button type='button' class='btn btn-danger right'>" + answer2 + "</button>");
	}

	//helper function 
	function guruChoice(message, category) {
		var random = randomNum(category);
		$("#question-holder").append("<h2>" + message + "<br>" + category[random] + "</h2>")
			.append("<button type='button' class='btn btn-danger find'>Find Restaurants</button>");
		keyword = category[random].toLowerCase();
		var dish = keyword.replace(/\s/g, "");
		$(".find").click(function() {
			//add goBack button to result
			$("#goBack-holder").html("<span class='goBack3'>X</span>");
			restaurantsSellThisDish(dish, keyword);
			$("#result").show();
		});
	}

	//Favorite Options Chosen
	$("body").on("click", "#favorite", function() {
		hidden();
		$("#question-holder").empty();
		$("#commonDishes").hide();
		$("#answerMe").show();
		$("#clickAnswer").on("click", function() {
			//clear all questions first
			$("#question-holder").empty();
			setTimeout(questionMaker("Are You Really Hungry?", "Yes", "No"), 2000);
			$(".left").click(function() {
				$(this).parent().remove();
				setTimeout(questionMaker("Do You Like Soup or Non-Soup?", "Non-Soup", "Soup"), 2000);
				$(".left").click(function() {
					$(this).parent().remove();
					setTimeout(questionMaker("Do You Like To Eat Noodle or Non-Noodle?", "Non-Noodle", "Noddle"), 2000);
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
					setTimeout(questionMaker("Do You Like Spicy Soup or Non Spice Soup?", "Spicy", "Non-Spicy"), 2000);
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
				setTimeout(questionMaker("Do You Just Like Apertizer or Sandwich?", "Apertizer", "Sandwich"), 2000);
				//case 5
				$(".left").click(function() {
					$(this).parent().remove();
					guruChoice("I Think You Should Try", apertizer);
					guruChoice("Or If You Just Want A Drink, Try", drink);
				});
				//case 6
				$(".right").click(function() {
					$(this).parent().remove();
					guruChoice("I Think You Should Try", non_apertizer);
					guruChoice("Or If You Just Want A Drink, Try", drink);
				});
			});
		});
		$("body").on("click", ".goBack3", function() {
			$(this).remove();
			console.log("click");
			$("answerMe").show();
			hidden();
			$("#question-holder").empty();
			$("#commonDishes").hide();
			$("#answerMe").show();
		});
	});

	// $(".backToMainPage").on("click", function() {
	// 	$("#answerMe").hide();
	// 	$("#lower1, #lower2").slideToggle("slow");
	// });

	//save name in of restaurant user chose to go in review database
	$("#restaurantList").on("click", ".chosen", function(event) {
		event.preventDefault();
		var name = $(this).attr("id");
		var reviewNeedToBeWritten = {
			business: name,
			thought: "Review for this visit has not been posted yet.",
			written: false,
			dateVisited: (new Date()).toDateString()
		};
		$.post("/api/reviews", reviewNeedToBeWritten);
		hidden();
		$("#panel").hide();
		$("#reminder").slideToggle();
		$("body").on("click", ".ok", function () {
			$("#reminder").hide();
			$("#lower1, #lower2").show();
		});
	});
});