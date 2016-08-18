var jwt = require('jsonwebtoken');

var SECRET = global.secret;

module.exports = function(req, res, next){
	if (req.headers.authorization){
		var auth = req.headers.authorization.split(' ');
		var token = auth[1];
		jwt.verify(token, SECRET, function(err, decoded){
			if (err){
                console.log(token);
				res.status(403).json({err: "Verifying the token threw an error"});
			}else{
				req.user = decoded;
				next();
			}
		});
		
	}else{
		res.status(403).json({err: [true, "Not authorized"]});
	}
}
