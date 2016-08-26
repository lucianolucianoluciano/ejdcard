var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise
var morgan = require('morgan');

global.secret = 'foratemer';    
mongoose.Promise = global.Promise

var authLogin = require('./routes/login.js');
var authSignin = require('./routes/signin.js');
var authMiddle = require('./middleware/interceptor.js');

var cardRouter = require('./routes/card.js');
var logRouter = require('./routes/log.js');

var app = express();
app.use('/ejdcard', express.static('cliente'));
app.use(morgan('dev'));

app.use(function(err, req, res, next){
	console.log(err.stack);
    return res.status(500);
});

// app.use(express.static('bsgama'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

var connection = mongoose.connect('mongodb://localhost/ejdcard');

// Requires authentication to every request to /api
app.use('/ejdcard/api', authMiddle);

// Public route for login (require authentication)
app.use('/ejdcard/access', authLogin);

// Requires auth to create a new user
app.use('/ejdcard/api/signin', authSignin);

app.use('/ejdcard/api/card', cardRouter);

app.use('/ejdcard/api/log', logRouter);

// Private route to students


app.use(function(req, res){
    res.status(404).end();
});

app.listen(3000, function(){console.log('Listening')});
