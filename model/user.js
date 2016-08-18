var mongoose = require('mongoose');
mongoose.Promise = global.Promise
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var userSchema = new Schema({
	_id: String,
	password: String,
	profile: {
		name: String,
		isAdmin: Boolean,
		level: Number,
		avatarUrl: String,
		createdAt: Date,
		lastLogin: Date
	}
});


var User = module.exports = mongoose.model('User', userSchema);

module.exports.saveIt = function(myUser, cb){
	var currentDate = new Date();

	myUser.profile.lastLogin = currentDate;

	if (!myUser.profile.createdAt){
		myUser.profile.createdAt = currentDate;
	}

	myUser.save(cb);
}

module.exports.hashifyAndSave = function(myUser, cb){
	bcrypt.genSalt(10, function(err, salt) {
    	bcrypt.hash(myUser.password, salt, function(err, hash) {
        	myUser.password = hash;
        	User.saveIt(myUser, cb);
    	});
    })
}

module.exports.getUserByUsername = function(username, cb){
	this.findById(username, cb);
}

module.exports.checkPassword = function(candidate, hash, cb){
	bcrypt.compare(candidate, hash, function(err, isMatch){
		if (err) cb(err, null);
        else cb(null, isMatch);
	});
}
