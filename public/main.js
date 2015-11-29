$(function() {
	var createMap = function() {
    	map = new google.maps.Map(document.getElementById('map'), {
      	center: { lat: 37.78, lng: -122.44 },
      	zoom: 13
    	});
  	};
  //for food description
  var $description = $("#foodDescription");
  var source1 = $("#description-template").html();
  var template1 = Handlebars.compile(source1);

  // for restaurants result
  var source2 = $("#restaurant-template").html();
  var template2 = Handlebars.compile(source2);

  //Top Dishes Option chosen
 	$("#top").click(function () {
 		$("#commonDishes").show();
	  $(".dropdown-menu li").click(function (event) {
	  	var keyword = $(this).text();
	  	$("span[data-bind='label']").html(keyword);
			keyword = keyword.toLowerCase();
			var dish = keyword.replace(/\s/g, "");
			function restaurantsSellThisDish () {
				$.get("/api/" + dish, function (data) {
					var restaurants = data.restaurants;
					var leftResult = restaurants.slice(0,5);
					var rightResult = restaurants.slice(-5);
					$("#restaurantList").empty();
					var restaurantHtmlLeft = template2({lefts: leftResult});
					$("#restaurantList").append(restaurantHtmlLeft);
					var restaurantHtmlRight = template2({rights: rightResult});
					$("#restaurantList").append(restaurantHtmlRight);

					restaurants.forEach(function(restaurant) {
						var contentString = '<div id="content">'+
													      '<div id="siteNo(tice">'+
													      '</div>'+
													      '<h4 id="firstHeading" class="firstHeading">'+ restaurant.name+'</h4>'+
													      '<div id="bodyContent">'+
													      '<p>'+restaurant.location.display_address[0]+
													      ', '+restaurant.location.display_address[1]+
													      '<br>'+restaurant.location.display_address[2]+'</p>'+
													      '</div>'+
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
						marker.addListener("click", function () {
							infowindow.open(map, marker);
						});
					});
				});
				
				//get description of dish from manually built api then append to the page
				$.get("/api/description", function (data) {
					var dishes = data.dishes;
					var foundDish;
					dishes.forEach(function (dish) {
						if (dish.name.toLowerCase() == keyword) {
							foundDish = dish;
						}
					});
					$("#foodDescription").empty();
					var descriptionHtml = template1({dish: foundDish});
					$description.append(descriptionHtml);
				});
				createMap();
			}
			restaurantsSellThisDish();
		});
	});

});