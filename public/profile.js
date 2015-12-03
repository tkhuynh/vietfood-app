$(function() {
	$("#visitedPlace-list").on("click", ".edit-button", function (event) {
		event.preventDefault();
		var id = $(this).attr("id");
		$(this).next().toggle();
		var $form = $(this).next();
		$form.on("submit", function(event) {
			event.preventDefault();
			var updatedReview = $(this).serialize();
			console.log(updatedReview);
			$.ajax({
				type: "PUT",
				url: "/api/reviews/" + id,
				data: updatedReview,
				success: function (data) {
					console.log(data);
					window.location.reload();
				}
			});
		});
	});
});