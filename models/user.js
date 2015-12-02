var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
  username: String,
  password: String,
  reviews: [{
		type: Schema.Types.ObjectId,
		ref: "Review"
	}]
});

//need to populate reviews
UserSchema.plugin(passportLocalMongoose , {
	populateFields: "reviews"
});

var User = mongoose.model('User', UserSchema);

module.exports = User;