var mongoose = require('mongoose');
mongoose.Promise = global.Promise
var Schema = mongoose.Schema;
 
var logSchema = new Schema({
    type: Number,
    timestamp: Number, 
    cardNumber: String,
    station: String,
    balanceBefore: Number,
    balanceAfter: Number
 });

module.exports = mongoose.model('Log', logSchema);