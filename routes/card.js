var express = require('express');

var _ = require('lodash');

var router = express.Router();

var Card = require('../model/card.js');
var Log = require('../model/log.js');

var CARD_NOT_FOUND = 'O cartão não está cadastrado';
var SERVER_FIND_CARDS = 'Ocorreu um erro no servidor ao procurar pelos cartões';

function getAllCards(req, res) {
    Card.find({}, function(err, card){
        if (err){
            console.log(err);
            return res.status(500).json({err:SERVER_FIND_CARDS});
        }else{
            return res.json(card);
        }
    });
};

function getOneCard(req, res) {
    Card.findOne({_id: req.params.id}, function(err, card){
        if (err){
            console.log(err);
            return res.status(500).json({err:SERVER_FIND_CARDS});
        }else{
            if (!card) return res.status(404).json({error: CARD_NOT_FOUND});
            res.json(card);
        }
    });
};

function addCard(req, res){
    var card = req.body;
    if (!_.isString(card._id) || !_.inRange(parseInt(card._id), 0, 701)){
        return res.status(406).json({error: 'You must provide a valid Card ID.'});
    }
    if (!_.isNumber(card.balance) || !_.inRange(card.balance, 0, 100000)){
        return res.status(406).json({error: 'You must provide a valid Balance.'});
    }
    if (!_.isString(card.owner.name)){
        return res.status(406).json({error: 'You must provide a valid Owners Name.'});
    }
    req.body._id = (parseInt(req.body._id)).toString();
    card = {
        _id: req.body._id,
        balance: req.body.balance,
        owner: {
            name: req.body.owner.name,
            cellphone: req.body.owner.cellphone
        },
        active: true
    };
    Card.findById(card._id, function(err, data){
        if (err) return res.status(500).json({error: "An error occured at checking if card already exists"});
        if (data) return res.status(406).json({error: "This card is already on the database."});
        var newCard = new Card(card);
        newCard.save(function(err, cardSaved){
            if (err) return res.status(500).json({error: "An error occured at inserting the data."});
            var log = {
                type: 1,
                timestamp: Date.now(),
                cardNumber: cardSaved._id,
                station: req.user.name,
                balanceBefore: 0,
                balanceAfter: cardSaved.balance
            };
            var newLog = new Log(log);
            newLog.save(function(err, logSave){
                if (err) return res.status(500).json({error: "Error at saving log. Card created"});
                var response = {
                    _id: cardSaved._id,
                    balance: cardSaved.balance,
                    active: cardSaved.active,
                    owner: {
                        name: cardSaved.owner.name,
                        cellphone: cardSaved.owner.cellphone
                    },
                    logId: logSave._id.toString()
                };
                res.status(201).json(response);
            });
        });
    });
    
};

function updateCard(req, res){
    var cardId = req.params.id;
    Card.findById(cardId, function(err, cardServer){
        if (err) return res.status(500).json({error: "Error at consulting card."});
        if (!cardServer) return res.status(404).json({error: "Card not found!"});
        if (!cardServer.active) return res.status(406).json({error: 'This card was deactived'});
        var incoming = req.body;
        var balanceBefore = 0;
        var type = 0;
        if (_.has(incoming, 'balance')){
            if (!_.isNumber(incoming.balance)){
                return res.status(406).json({error: 'You must provide a valid Balance.'});
            }
            if (!_.inRange(incoming.balance, 0, 10000)){
                console.log('aqui2');
                return res.status(406).json({error: 'You cannot change the balance to a negative number'});
            }
            if (incoming.balance > cardServer.balance) type = 3;
            else type = 2;
            balanceBefore = cardServer.balance;
            cardServer.balance = incoming.balance;
        }
        if (_.has(incoming, 'active')){
            if (!_.isBoolean(incoming.active)){
                return res.status(406).json({error: 'The active field must be boolean'});
            }
            type = 4;
            cardServer.active = incoming.active;
        }
        cardServer.save(function(err){
            if (err) res.status(500).json({error: 'Error at updating the card.'});
            var log = {
                type: type,
                timestamp: Date.now(),
                cardNumber: cardServer._id,
                station: req.user.name,
                balanceBefore: balanceBefore,
                balanceAfter: cardServer.balance
            };
            var newLog = new Log(log);
            newLog.save(function(err, logSave){
                if (err) return res.status(500).json({error: "Error at saving log. Card updated"});
                var response = {
                    _id: cardServer._id,
                    balance: cardServer.balance,
                    active: cardServer.active,
                    owner: {
                        name: cardServer.owner.name,
                        cellphone: cardServer.owner.cellphone
                    },
                    logId: logSave._id.toString()
                };
                res.status(200).json(response);
            });
        });
        
    });
}

router.get('/', getAllCards);
router.get('/:id', getOneCard);
router.post('/', addCard);
router.patch('/:id', updateCard);
router.delete('/', function(req, res){
    Card.remove({}, function(err, data){
        res.status(200).end();
    });
});

module.exports = router;