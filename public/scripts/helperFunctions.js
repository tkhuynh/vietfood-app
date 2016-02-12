var createMap = function() {
	var currentLongitude = Number(localStorage.getItem("longitude"));
	var currentLatitude = Number(localStorage.getItem("latitude"));
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: currentLatitude,
			lng: currentLongitude
		},
		zoom: 12
	});
};

function getLocation() {
	localStorage.clear();
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(success);
	} else {
		alert("If you don't allow location service, default will be San Francisco.");
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
			zipCode = results[0].address_components[6].short_name;
			localStorage.setItem("zipCode", zipCode);
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
//for review 
function review() {
	$("#result").hide();
	$("html, body").animate({
		scrollTop: 0
	});
	$("#reminder").show();
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
	$("#result").hide();
	$("#option-wrapper").show();
}