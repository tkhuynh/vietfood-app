$(function() {
	getLocation();
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

	// 15 common dishes
	$("#first_option").on("click", function() {
		$("#option-wrapper").hide();
		$("#dish-holder").show();
		$(".close_dish_holder").on("click", function() {
			$("#option-wrapper").show();
			$("#dish-holder").hide();
		});
	});

	$("#dish-holder").on("click", "img", function(event) {
		$("#dish-holder").hide();
		var keyword = $(this).attr("id").replace(/_/g, " ");
		var dish = keyword.replace(/\s/g, "");
		restaurantsSellThisDish(dish, keyword);
		$("#result").show();
		$(".close_result").on("click", function() {
			$("#result").hide();
			$("#dish-holder").show();
		});
		$("#restaurantList").on("click", ".chosen", review);
	});


	//Random Options Chosen
	$("#random").click(function() {
		var random = randomNum(commonDishes);
		keyword = commonDishes[random];
		var dish = keyword.replace(/\s/g, "");
		restaurantsSellThisDish(dish, keyword);
		$("#option-wrapper").hide();
		$("#result").show();
		$(".close_result").on("click", backToMainPage);
		$("#restaurantList").on("click", ".chosen", review);
	});

	//function helper 
	function questionMaker(question, answer1, answer2) {
		$("#question-holder").empty();
		$("#question-holder").append("<div class='question text-center'></div>");
		$(".question")
			.append("<h2>" + question + "</h2>")
			.append("<button type='button' class='btn btn-danger left'>" + answer1 + "</button>")
			.append("<button type='button' class='btn btn-danger right'>" + answer2 + "</button>");
	}

	//helper function 
	function guruChoice(message, category) {
		var random = randomNum(category);
		getImageId = category[random].toLowerCase().replace(/\s/g, "_");
		$image = $("#" + getImageId).clone();
		$image.attr("id", "guru_choice_pic").addClass("thumbnail");
		console.log($image);
		$("#question-holder").append("<div class='guru-result'</div>");
		$(".guru-result").append("<h2>" + message + " " + category[random] + "</h2>")
			.append($image)
			.append("<button type='button' class='btn btn-danger find'>Find Restaurants</button>");
		keyword = category[random].toLowerCase();
		var dish = keyword.replace(/\s/g, "");
		$(".find").click(function() {
			$("#question-holder").empty();
			//add goBack button to result
			restaurantsSellThisDish(dish, keyword);
			$("#result").show();
		});
	}

	//Guru Option
	$("#favorite").on("click", function() {
		var answerMeContainerHeight = Math.floor($(window).height() * 0.85);
		var marginPx = Math.floor(($(window).height() - $(".navbar").height() - answerMeContainerHeight) / 2);
		$("#option-wrapper").hide();
		$("#question-holder").empty();
		$("#question-holder").hide();
		$("#answerMe").css("height", answerMeContainerHeight + "px").css("margin-top", marginPx + "px").show();
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
		// for user to go back to main page if don't want to answer guru
		$(".close_guru_option").on("click", function() {
			$("#option-wrapper").show();
			$("#answerMe").hide();
		});
		// back to main page
		$(".close_result").on("click", backToMainPage);
		$("#restaurantList").on("click", ".chosen", review);
	});
});