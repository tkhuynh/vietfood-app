$(function () {
	//reviews part
	var baseUrl = "/api/reviews";
	var allReviews = [];
	var $reviewList = $("#review-list");
	var source3 = $("#review-template").html();
	var template3 = Handlebars.compile(source3);
	//helper function
	function render () {
		$reviewList.empty();
		var reviewHtml = template3 ({reviews: allReviews});
		$reviewList.append(reviewHtml);
	}

	$.get(baseUrl, function (data) {
		// only return acutal written reviews
		allReviews = data.reviews.filter(function(review) {
			return review.thought != "Please write a review for your last visit.";
		});
		allReviews.reverse();
		render();
	});
});