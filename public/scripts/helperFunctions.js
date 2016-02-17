function getLocation() {
	localStorage.clear();
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(success);
	} else {
		alert("If you don't allow location service, you will be ask for zip code!ß");
	}
}

function success(position) {
	var positionInfo = position.coords;
	x = positionInfo.latitude;
	y = positionInfo.longitude;
	var geocoder = new google.maps.Geocoder();

	function getLocationZipcode(geocoder) {
		var latlng = {
			lat: x,
			lng: y
		};
		geocoder.geocode({
			'location': latlng
		}, function(results, status) {
			// get zip code from result
			zipCode = results[0].formatted_address.match(/CA\s\d{5}/)[0].slice(-5);
			if (/\d{5}/.test(zipCode)) {
				localStorage.setItem("zipCode", zipCode);
			} else {
				// if failed to get zip code with above method
				zipCode = results[2].address_components[0].short_name;
				// if failed a gain, do a prompt to get zip code entered from user
				while (/\d{5}/.test(zipCode) === false) {
					zipCode = prompt("Failed to get currrent location.\nPlease enter zip code.");
				}
				localStorage.setItem("zipCode", zipCode);
			}
			localStorage.setItem("latitude", x);
			localStorage.setItem("longitude", y);
		});
	}
	getLocationZipcode(geocoder);
}

//for chosen dish

//for food description
var $description = $("#foodDescription");
var source1 = $("#description-template").html();
var template1 = Handlebars.compile(source1);

// for restaurants result
var source2 = $("#restaurant-template").html();
var template2 = Handlebars.compile(source2);

function restaurantsSellThisDish(dish, keyword) {
	var currentLocation = localStorage.getItem("zipCode");
	$("#result").show();
	$("#map").show();
	var createMap = function(lat, lng) {
		map = new google.maps.Map(document.getElementById('map'), {
			center: {
				lat: lat,
				lng: lng
			},
			scrollwheel: false,
			draggable: false,
			zoom: 12
		});
	};
	$("#answerMe").hide();
	$.get("/api/" + dish, {
		location: currentLocation
	}, function(data) {
		console.log(data);
		$("#result, .goBack, .goBack2").show();
		var restaurants = data.restaurants;
		var currentLatitude = data.lnglat.latitude;
		var currentLongitude = data.lnglat.longitude;
		createMap(currentLatitude, currentLongitude);
		$("#restaurantList").empty();
		var restaurantHtml = template2({
			restaurants: restaurants
		});
		$("#restaurantList").append(restaurantHtml);
		restaurants.forEach(function(restaurant) {
			var contentString = '<div id="content">' +
				'<div id="siteNotice">' +
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
}
//for review 
function review() {
	$("#result").hide();
	$("html, body").animate({
		scrollTop: 0
	});
	$("#reminder").show();
	var name = $(this).attr("id");
	var address1 = $(this).prev().find("p").first().text();
	var address2 = $(this).prev().find("p:nth-child(3)").text().replace(/CA - /, "CA ");
	console.log(address1, address2);
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
	$("body").on("click", ".ok", function() {
		$("#reminder").hide();
		$("#option-wrapper").show();
	});
}

//generation random number from 0 to less than array.length
function randomNum(array) {
	return Math.floor(Math.random() * array.length);
}

//back to main page from result
function backToMainPage() {
	$("#foodDescription").empty();
	$("#restaurantList").empty();
	$("#dish-holder").hide();
	$("#result").hide();
	$("#option-wrapper").show();
}

//guru choice
function guruChoice(message, category) {
	var random = randomNum(category);
	getImageId = category[random].toLowerCase().replace(/\s/g, "_");
	$image = $("#" + getImageId).clone();
	$image.attr("id", "guru_choice_pic").addClass("thumbnail find");
	console.log($image);
	$("#question-holder").append("<div class='guru-result'</div>");
	$(".guru-result").append("<h2>" + message + " " + category[random] + "</h2>")
		.append($image)
		.append("<button type='button' class='btn btn-danger find'>Find Restaurants</button>");
	keyword = category[random].toLowerCase();
	var dish = keyword.replace(/\s/g, "");
	$(".find").click(function() {
		$("#question-holder").empty();
		restaurantsSellThisDish(dish, keyword);
	});
}