var express = require('express');

var router = express.Router();

var User = require('../model/user.js');

var jwt = require('jsonwebtoken');

var SECRET = global.secret;

var logInFn = function(req, res){
	User.getUserByUsername(req.body.login, function(err, user){
		if (err){
			console.log(err);
			return res.status(500).json({err:"An error occured at find a user"});
		} else if (!user){
			console.log(req.body.login);
			return res.status(406).json({err:"User and/or password are incorrect!"});
		}else{
			User.checkPassword(req.body.password, user.password, function(err, isMatch){
				if (err) {
					console.log(err);
					res.status(500).json({err:"An error occured at checking the password"});
				}else if (!isMatch){
					res.status(500).json({err:"User and/or password are incorrect/pass"});
				}else{
					var payload = user.profile;
					jwt.sign(payload, SECRET, { algorithm: 'HS256' }, function(err, token) {
					  	res.status(200).json({token: token}).end();
					});
				}
			});
		}
	});
}

router.post('/login', logInFn);

module.exports = router;