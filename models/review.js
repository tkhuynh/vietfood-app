var mongoose = require("mongoose"),
		Schema = mongoose.Schema;

var ReviewSchema = new Schema({
				business: String,
				thought: String,
				dateVisited: String,
				author: {
					type: Schema.Types.ObjectId,
					ref: "User"
				}
});

var Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;