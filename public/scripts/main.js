$(function() {
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
	var createMap = function(lat, longs) {
		map = new google.maps.Map(document.getElementById('map'), {
			center: {
				lat: lat,
				lng: longs
			}
			// zoom: 8
		});
		
	};

	//save location to local storage
	$('#searchLocation').submit( function(event){
		event.preventDefault();
		var location = $("#location").val();
		console.log(location);
		localStorage.setItem("location", location);
	});


	//helper functions
	function restaurantsSellThisDish(dish, keyword) {
		$("#answerMe").hide();
		$("#map").show();
		$.get("/api/" + dish, {location: localStorage.getItem("location")}, function(data) {
			console.log(data);
			var longs = Number(data.region.center.longitude);
			var lat = Number(data.region.center.latitude);
			console.log('lat',lat,"long",longs);
			console.log(typeof longs);
			console.log(typeof lat);
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
			
			createMap(lat, longs);
			
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
					icon: '/images/restaurant.png'
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

	//Top Dishes option trial
	$(".topOption").click(function() {
		$("#panel").slideToggle("slow");
		$("#lower1, #lower2, #lower3").toggle();
	});
	$(".topOption2").click(function() {
		$('#picsHolder2').hide();
		$('#picsHolder1').show();
		$("#panel").slideToggle("slow");
		$("#lower1, #lower2, #lower3").toggle();
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

		$("#restaurantList").on("click", ".chosen", function(event) {
			$("#picsHolder1, #picsHolder2").hide();
			$("#panel").hide();
			picsHolder.show();
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
				$("#lower1, #lower2, #lower3").show();
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
		$("#lower1, #lower2, #lower3").hide();
		$("#answerMe").hide();
		$("#result").show();
		var random = randomNum(commonDishes);
		keyword = commonDishes[random];
		var dish = keyword.replace(/\s/g, "");
		restaurantsSellThisDish(dish, keyword);
		$(".goBack2").click(function() {
			$(this).hide();
			$("#lower1, #lower2, #lower3").show();
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
				$("#lower1, #lower2, #lower3").show();
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