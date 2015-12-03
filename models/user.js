var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
  username: {
  	type: String,
  	validate: {
  		validator: function (name) {
  			if (/[^a-z0-9._-]/gi.test(name)) {
  				return false;
  			}
  			return true;
  		},
  		message: "Please don't use special character."
  	}
  },
  password: String,
  reviews: [{
		type: Schema.Types.ObjectId,
		ref: "Review"
	}]
});

var validatePassword = function (password, callback) {
	if (password.length < 6) {
		return callback({code : 422, message: "Password must be at least 6 characters."});
	}
	return callback(null);
};

//need to populate reviews
UserSchema.plugin(passportLocalMongoose , {
	populateFields: "reviews",
	passwordValidator: validatePassword
});

var User = mongoose.model('User', UserSchema);

module.exports = User;