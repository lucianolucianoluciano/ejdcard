var express = require('express');

var _ = require('lodash');

var router = express.Router();

var Log = require('../model/log.js');

function getOneLog(req, res){
    Log.findById(req.params.id, function(err, data){
        if (err) return res.status(500).json({error: "Error occured at searching log"});
        if (!data) return res.status(404).json({error: "No log found"});
        res.json(data);
    })
};

function getAllLogs(req, res){
    Log.find({}, function(err, data){
        if (err) return res.status(500).json({error: "Error occured at searching log"});
        if (!data) return res.status(404).json({error: "No log found"});
        res.json(data);
    });
};

router.get('/', getAllLogs);
router.get('/:id', getOneLog);

module.exports = router;