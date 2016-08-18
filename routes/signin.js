var express = require('express');

var router = express.Router();

var User = require('../model/user.js');

var jwt = require('jsonwebtoken');

var SECRET = global.secret;
var signInFn = function(req, res){

	User.getUserByUsername(req.body.login, function(err, user){
		if (err){
            console.log(err);
			return res.status(500);
		} else if (user){
			return res.status(406).json({err:"User is already registered"}).end();
		}else{

			if (!req.body.login || !req.body.name || !req.body.password){
				return res.status(406).json({err: "All field are required!"});
			}
			var newUser = new User({
		    	_id: req.body.login,
		    	password: req.body.password,
		    	profile: {
		    		name: req.body.name,
		    		level: 1,
		    		isAdmin: true
		    	}
		    });


		    User.hashifyAndSave(newUser, function(err){
		    	if (err){
                    console.log(err)
		    		res.status(500).end();
		    	}else{
		    		res.status(201).end();
		    	}
		    });

		}

	});

    
};


router.post('/', signInFn);

module.exports = router;