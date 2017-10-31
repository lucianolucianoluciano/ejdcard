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

// You should install mongodb in order for this to work. And it should also be running.
// You can check is mongodb is running typing 'mongo' in your shell
var connection = mongoose.connect('mongodb://localhost/ejdcard');

// Requires authentication to every request to /api
// Comment this line if you want to add new users through /ejdcard/api/signin
app.use('/ejdcard/api', authMiddle);

// Public route for login (require authentication)
app.use('/ejdcard/access', authLogin);

// Requires auth to create a new user
app.use('/ejdcard/api/signin', authSignin);

// Route that create, read and modify cards data. Use rest.md file for guidance
app.use('/ejdcard/api/card', cardRouter);

// Route that recover all logs from the system and also get info of one specific log
app.use('/ejdcard/api/log', logRouter);

app.use(function(req, res){
    res.status(404).end();
});

const PORT = 3000;
app.listen(PORT, function(){console.log('Escutando requisições na porta ' + PORT + '. Acesse via http://localhost:'+ PORT+'/ejdcard')});

// Remember no `npm install` in this root folder and also in _cliente_ folder in order to install package's dependencies