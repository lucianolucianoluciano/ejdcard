var supertest = require("supertest");
var should = require("should");
var HTTP_SC_OK = 200;
var HTTP_SC_CREATED = 201;
var HTTP_SC_NO_CONTENT = 204;
var HTTP_SC_NOT_FOUND = 404;
var HTTP_SC_NOT_ACCEPTABLE = 406;
var HTTP_SC_FORBIDDEN = 403;

var app = supertest("http://localhost:8080/ejdcard/api/");
var CARD_RESOURCE = "card/";

function generateRandomId(){
    return parseInt(Math.random()*700);
}

// REMEMBER OF AUTHENTICATION

describe('ejdcard', function(){

    describe('Requesting invalid cards data', function(){
        it('Should return 404 NOT FOUND at GET', function(done){
            app.get(CARD_RESOURCE+generateRandomId().toString())
               .expect(HTTP_SC_NOT_FOUND)
               .end(done);
        });

        it('Should return 404 NOT FOUND at PUT', function(done){
            app.put(CARD_RESOURCE+generateRandomId().toString())
               .expect(HTTP_SC_NOT_FOUND,done);
        });

        it('Should return 404 NOT FOUND at DELETE', function(done){
            app.delete(CARD_RESOURCE+generateRandomId().toString())
               .expect(HTTP_SC_NOT_FOUND, done);
        });
    });

    describe('Trying to add a new card with invalid data', function(){
        it('Should return 406 NOT ACCEPTABLE with no id', function(done){
            var invalidCard = {
                owner: {
                    name: "Beatrizinha Cunha",
                    cellphone: "(83)98809-3702"
                },
                balance: 12500
            };
            app.post(CARD_RESOURCE)
               .send(invalidCard)
               .expect(HTTP_SC_NOT_ACCEPTABLE)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("error").equal("You must provide a valid Card ID.");
                   done();
               });
        });
        it('Should return 406 NOT ACCEPTABLE with an id greater than 700', function(done){
            var invalidCard = {
                _id: "701",
                owner: {
                    name: "Beatrizinha Cunha",
                    cellphone: "(83)98809-3702"
                },
                balance: 12500
            };
            app.post(CARD_RESOURCE)
               .send(invalidCard)
               .expect(HTTP_SC_NOT_ACCEPTABLE)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("error").equal("You must provide a valid Card ID.");
                   done();
               });
        });
        it('Should return 406 NOT ACCEPTABLE with no balance', function(done){
            var invalidCard = {
                _id: "200",
                owner: {
                    name: "Beatrizinha CUnha",
                    cellphone: "(83)98809-3702"
                }
            };
            app.post(CARD_RESOURCE)
               .send(invalidCard)
               .expect(HTTP_SC_NOT_ACCEPTABLE)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("error").equal("You must provide a valid Balance.");
                   done();
               });
        });
        it('Should return 406 NOT ACCEPTABLE with no owners name', function(done){
            var invalidCard = {
                _id: "200",
                owner: {
                    cellphone: "(83)98809-3702"
                },
                balance: 12500
            };
            app.post(CARD_RESOURCE)
               .send(invalidCard)
               .expect(HTTP_SC_NOT_ACCEPTABLE)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("error").equal("You must provide a valid Owners Name.");
                   done();
               });
        });
    });

    describe('Adding new cards with valid data and checking log', function(){

        it('Should return 201 CREATED and 200 at consulting it - 0 balance', function(done){
            var validCard = {
                _id: "100",
                balance: 0,
                owner: {
                    name: "Lucianinho Junior",
                    cellphone: "(83)98827-2999"
                }
            };
            app.post(CARD_RESOURCE)
               .send(validCard)
               .expect(HTTP_SC_CREATED)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("_id").equal("100");
                   res.body.should.have.property("logId");
                   done();
               });
        });

        it('Should return 201 CREATED and 200 at consulting it - no cellphone', function(done){
            var validCard = {
                _id: "101",
                balance: 0,
                owner: {
                    name: "Lucianinho Junior"
                }
            };
            app.post(CARD_RESOURCE)
               .send(validCard)
               .expect(HTTP_SC_CREATED)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("_id").equal("100");
                   res.body.should.have.property("logId");
                   done();
               });
        });

        it('Should return 201 CREATED and 200 at consulting it - complete', function(done){
            var validCard = {
                _id: "102",
                balance: 12.99,
                owner: {
                    name: "Lucianinho Junior",
                    cellphone: "(83)98827-2999"
                }
            };
            app.post(CARD_RESOURCE)
               .send(validCard)
               .expect(HTTP_SC_CREATED)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("_id").equal("100");
                   res.body.should.have.property("balance").equal(12.99);
                   res.body.should.have.property("owner").and.should.have.value("name", "Lucianinho Junior");
                   res.body.should.have.property("owner").and.should.have.value("cellphone", "(83)98827-2999");
                   res.body.should.have.property("logId");
                   done();
               });
        });
    });

    describe('Adding new cards with existing ids', function(){

        it('Should return 406 NOT ACCEPTABLE when trying to add a card with an existing id', function(done){
            var validCard = {
                _id: "102",
                balance: 12.99,
                owner: {
                    name: "Lucianinho Junior",
                    cellphone: "(83)98827-2999"
                }
            };
            app.post(CARD_RESOURCE)
               .send(validCard)
               .expect(HTTP_SC_NOT_ACCEPTABLE)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("error").equal("You must provide a valid Card ID.");
                   done();
               });
        });

    });

    describe('Changing balance of cards with invalid data', function(){});

    describe('Changing balance of cards with valid data and checking after', function(){});

    describe('Setting card status to unactive and trying to execute operations after', function(){});

});