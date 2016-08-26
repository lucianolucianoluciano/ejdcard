var mongoose = require('mongoose');
mongoose.Promise = global.Promise
var Schema = mongoose.Schema;

var userSchema = new Schema({
	_id: String,
	balance: Number,
	owner: {
     name: String,
     cellphone: String
    },
    active: Boolean
});

module.exports = mongoose.model('Card', userSchema);
