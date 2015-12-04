var mongoose = require("mongoose"),
		Schema = mongoose.Schema;

var ReviewSchema = new Schema({
				business: String,
				address1: String,
				address2: String,
				thought: String,
				dateVisited: String,
				written: Boolean,
				author: {
					type: Schema.Types.ObjectId,
					ref: "User"
				}
});

var Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;