var supertest = require("supertest");
var should = require("should");
var HTTP_SC_OK = 200;
var HTTP_SC_CREATED = 201;
var HTTP_SC_NO_CONTENT = 204;
var HTTP_SC_NOT_FOUND = 404;
var HTTP_SC_NOT_ACCEPTABLE = 406;
var HTTP_SC_FORBIDDEN = 403;

var app = supertest("http://localhost:3000/ejdcard/api/");
var headers = {
    "Authorization": "Bearer "
};
var login_app = supertest("http://localhost:3000/ejdcard/access");
var CARD_RESOURCE = "card/";
var LOG_RESOURCE = 'log/';

function generateRandomId(){
    return parseInt(Math.random()*700);
}

// REMEMBER OF AUTHENTICATION

describe('ejdcard', function(){

    before(function(done){
        var head = {
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc0FkbWluIjp0cnVlLCJsZXZlbCI6MSwibmFtZSI6IkJlYXRyaXogQ3VuaGEiLCJsYXN0TG9naW4iOiIyMDE2LTA4LTI0VDExOjE5OjM0LjEyMVoiLCJjcmVhdGVkQXQiOiIyMDE2LTA4LTI0VDExOjE5OjM0LjEyMVoifQ.QUOyytnRnNyZafbfh7LS2xWD090dQJfqqPvaD2tC9m4"
        };
        app.del(CARD_RESOURCE).set(head).expect(200).end(done);
    });
    // describe('Trying to do requests without auth', function(){
    //     it.only('Should return 403 at getting some card', function(done){
    //         app.get(CARD_RESOURCE+generateRandomId().toString())
    //            .expect(HTTP_SC_FORBIDDEN)
    //            .end(done());
    //     });
    //     it('Should return 403 at patching data', function(done){
    //         app.patch(CARD_RESOURCE+generateRandomId().toString())
    //            .send({})
    //            .expect(HTTP_SC_FORBIDDEN)
    //            .end(done());
    //     });
    // });

    describe('Logging in and getting the token', function(){

        it('Should return 200 and the token', function(done){
            var user = {
                login: "tester",
                password: "gosafadon"
            };
            login_app.post('/login')
                     .send(user)
                     .expect(HTTP_SC_OK)
                     .expect('Content-type', /json/)
                     .end(function(err, res){
                         if (err) {
                             done(err);
                         }else{
                            res.body.should.have.property('token');
                            headers['Authorization'] += res.body.token;
                            done();            
                         }
                     });
        });

    });
    describe('Requesting invalid cards data', function(){
        it('Should return 404 NOT FOUND at GET', function(done){
            app.get(CARD_RESOURCE+generateRandomId().toString())
               .set(headers)
               .expect(HTTP_SC_NOT_FOUND)
               .end(done);
        });

        it('Should return 404 NOT FOUND at PUT', function(done){
            app.put(CARD_RESOURCE+generateRandomId().toString())
               .set(headers) 
               .expect(HTTP_SC_NOT_FOUND,done);
        });

        it('Should return 404 NOT FOUND at DELETE', function(done){
            app.del(CARD_RESOURCE+generateRandomId().toString())
               .set(headers)
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
               .set(headers)
               .expect(HTTP_SC_NOT_ACCEPTABLE)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("error").equal("You must provide a valid Card ID.");
                   done();
               });
        });
        it('Should return 406 NOT ACCEPTABLE with negative balance', function(done){
            var invalidCard = {
                _id: '100',
                owner: {
                    name: "Carolina Idiota",
                    cellphone: "(83)98810-3702"
                },
                balance: -100
            };
            app.post(CARD_RESOURCE)
               .send(invalidCard)
               .set(headers)
               .expect(HTTP_SC_NOT_ACCEPTABLE)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("error").equal("You must provide a valid Balance.");
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
               .set(headers)
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
               .set(headers)
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
               .set(headers)
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
               .set(headers)
               .expect(HTTP_SC_CREATED)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("_id").equal("100");
                   res.body.should.have.property("logId");
                   var log = res.body.logId;
                   app.get(LOG_RESOURCE+log)
                      .expect(HTTP_SC_OK)
                      .set(headers)
                      .expect('Content-type', /json/)
                      .end(function(err, res){
                          if (err) return done(err);
                          res.body.should.have.property('timestamp');
                          res.body.timestamp.should.be.a.type('number');
                          res.body.should.have.property('balanceBefore');
                          res.body.balanceBefore.should.be.a.type('number').equal(0);
                          res.body.should.have.property('balanceAfter');
                          res.body.balanceAfter.should.be.a.type('number').equal(0);
                          res.body.should.have.property('cardNumber');
                          res.body.cardNumber.should.be.a.type('string').equal('100');
                          res.body.should.have.property('station');
                          res.body.should.have.property('type');
                          res.body.type.should.be.a.type('number').equal(1);
                          done();
                      });
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
               .set(headers)
               .expect(HTTP_SC_CREATED)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("_id").equal("101");
                   res.body.should.have.property("balance").equal(0);
                   res.body.should.have.property("active").equal(true);
                   res.body.should.have.property("owner");
                   res.body.owner.should.have.property("name").equal("Lucianinho Junior");
                   res.body.owner.should.not.have.property("cellphone");
                   res.body.should.have.property("logId");
                   var log = res.body.logId;
                   app.get(LOG_RESOURCE+log)
                      .expect(HTTP_SC_OK)
                      .set(headers)
                      .expect('Content-type', /json/)
                      .end(function(err, res){
                          if (err) return done(err);
                          res.body.should.have.property('timestamp');
                          res.body.timestamp.should.be.a.type('number');
                          res.body.should.have.property('balanceBefore');
                          res.body.balanceBefore.should.be.a.type('number').equal(0);
                          res.body.should.have.property('balanceAfter');
                          res.body.balanceAfter.should.be.a.type('number').equal(0);
                          res.body.should.have.property('cardNumber');
                          res.body.cardNumber.should.be.a.type('string').equal('101');
                          res.body.should.have.property('station');
                          res.body.should.have.property('type');
                          res.body.type.should.be.a.type('number').equal(1);
                          done();
                      });
               });
        });

        it('Should return 201 CREATED and 200 at consulting it - complete', function(done){
            var validCard = {
                _id: "102",
                balance: 1299,
                owner: {
                    name: "Lucianinho Junior",
                    cellphone: "(83)98827-2999"
                }
            };
            app.post(CARD_RESOURCE)
               .send(validCard)
               .set(headers)
               .expect(HTTP_SC_CREATED)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("_id").equal("102");
                   res.body.should.have.property("balance").equal(1299);
                   res.body.should.have.property("active").equal(true);
                   res.body.should.have.property("owner");
                   res.body.owner.should.have.property("name").equal("Lucianinho Junior");
                   res.body.owner.should.have.property("cellphone").equal("(83)98827-2999");
                   res.body.should.have.property("logId");
                   var log = res.body.logId;
                   app.get(LOG_RESOURCE+log)
                      .expect(HTTP_SC_OK)
                      .set(headers)
                      .expect('Content-type', /json/)
                      .end(function(err, res){
                          if (err) return done(err);
                          res.body.should.have.property('timestamp');
                          res.body.timestamp.should.be.a.type('number');
                          res.body.should.have.property('balanceBefore');
                          res.body.balanceBefore.should.be.a.type('number').equal(0);
                          res.body.should.have.property('balanceAfter');
                          res.body.balanceAfter.should.be.a.type('number').equal(1299);
                          res.body.should.have.property('cardNumber');
                          res.body.cardNumber.should.be.a.type('string').equal('102');
                          res.body.should.have.property('station');
                          res.body.should.have.property('type');
                          res.body.type.should.be.a.type('number').equal(1);
                          done();
                      });
               });
        });
    });

    describe('Adding new cards with existing ids', function(){

        it('Should return 406 NOT ACCEPTABLE when trying to add a card with an existing id', function(done){
            var validCard = {
                _id: "102",
                balance: 1299,
                owner: {
                    name: "Lucianinho Junior",
                    cellphone: "(83)98827-2999"
                }
            };
            app.post(CARD_RESOURCE)
               .send(validCard)
               .set(headers)
               .expect(HTTP_SC_NOT_ACCEPTABLE)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("error").equal("This card is already on the database.");
                   done();
               });
        });

        it('Should return 406 NOT ACCEPTABLE when trying to add a card with an existing id', function(done){
            var validCard = {
                _id: "100",
                balance: 1299,
                owner: {
                    name: "Lucianinho Junior"
                }
            };
            app.post(CARD_RESOURCE)
               .send(validCard)
               .set(headers)
               .expect(HTTP_SC_NOT_ACCEPTABLE)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("error").equal("This card is already on the database.");
                   done();
               });
        });

    });

    describe('Changing balance of cards with invalid data', function(){


        it('Should return 406 NOT ACCEPTABLE when modifying balance to a negative number', function(done){
            
            var modified = {
                balance: -20
            };

            app.patch(CARD_RESOURCE+'101')
               .set(headers)
               .send(modified)
               .expect(HTTP_SC_NOT_ACCEPTABLE)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("error").equal("You cannot change the balance to a negative number");
                   done();
                });
        });


        it('Should return 406 NOT ACCEPTABLE when modifying the balance with another type', function(done){
            
            var modified = {
                balance: "500 conto"
            };

            app.patch(CARD_RESOURCE+'101')
               .set(headers)
               .send(modified)
               .expect(HTTP_SC_NOT_ACCEPTABLE)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property("error").equal("You must provide a valid Balance.");
                   done();
                });
        });

        // it('Should return 406 NOT ACCEPTABLE when modifying the name with another type', function(done){
            
        //     var modified = {
        //         owner: {
        //             name: 1030
        //         }
        //     };

        //     app.patch(CARD_RESOURCE+'101')
        //        .send(modified)
        //        .expect(HTTP_SC_NOT_ACCEPTABLE)
        //        .expect('Content-type', /json/)
        //        .end(function(err, res){
        //            if (err) return done(err);
        //            res.body.should.have.property("err").equal("You must provide a valid Owners Name.");
        //            done();
        //         });
        // });

    });

    describe('Changing balance of cards with valid data and checking after', function(){

        it('Should return 200 and the log number', function(done){
            var newCard = {
                balance: 1000
            };

            app.patch(CARD_RESOURCE+'101')
               .set(headers)
               .send(newCard)
               .expect(HTTP_SC_OK)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property('balance').equal(1000);
                   res.body.should.have.property('owner');
                   res.body.should.have.property('logId');
                   res.body.owner.should.have.property('name').equal('Lucianinho Junior');
                   var log = res.body.logId;

                   app.get(LOG_RESOURCE+log)
                      .set(headers)
                      .expect(HTTP_SC_OK)
                      .expect('Content-type', /json/)
                      .end(function(err, res){
                          if (err) return done(err);

                          res.body.should.have.property('timestamp');
                          res.body.timestamp.should.be.a.type('number');
                          res.body.should.have.property('balanceBefore');
                          res.body.balanceBefore.should.be.a.type('number').equal(0);
                          res.body.should.have.property('balanceAfter');
                          res.body.balanceAfter.should.be.a.type('number').equal(1000);
                          res.body.should.have.property('cardNumber');
                          res.body.cardNumber.should.be.a.type('string').equal('101');
                          res.body.should.have.property('station');
                          res.body.should.have.property('type');
                          res.body.type.should.be.a.type('number').equal(3);

                          app.get(CARD_RESOURCE+'101')
                            .set(headers)
                            .expect(HTTP_SC_OK)
                            .expect('Content-type', /json/)
                            .end(function(err, res){
                                if (err) return done(err);
                                res.body.should.have.property('balance').equal(1000);
                                res.body.should.have.property('owner');
                                res.body.owner.should.have.property('name').equal('Lucianinho Junior');
                                done();
                            });
                      });

                   
               });

        });

        it('Should return 200 and the log number', function(done){
            var newCard = {
                balance: 100
            };

            app.patch(CARD_RESOURCE+'102')
               .set(headers)
               .send(newCard)
               .expect(HTTP_SC_OK)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property('balance').equal(100);
                   res.body.should.have.property("active").equal(true);
                   res.body.should.have.property('owner');
                   res.body.should.have.property('logId');
                   res.body.owner.should.have.property('name').equal('Lucianinho Junior');
                   var log = res.body.logId;

                   app.get(LOG_RESOURCE+log)
                      .set(headers)
                      .expect(HTTP_SC_OK)
                      .expect('Content-type', /json/)
                      .end(function(err, res){
                          if (err) return done(err);

                          res.body.should.have.property('timestamp');
                          res.body.timestamp.should.be.a.type('number');
                          res.body.should.have.property('balanceBefore');
                          res.body.balanceBefore.should.be.a.type('number').equal(1299);
                          res.body.should.have.property('balanceAfter');
                          res.body.balanceAfter.should.be.a.type('number').equal(100);
                          res.body.should.have.property('cardNumber');
                          res.body.cardNumber.should.be.a.type('string').equal('102');
                          res.body.should.have.property('station');
                          res.body.should.have.property('type');
                          res.body.type.should.be.a.type('number').equal(2);

                          app.get(CARD_RESOURCE+'102')
                            .set(headers)
                            .expect(HTTP_SC_OK)
                            .expect('Content-type', /json/)
                            .end(function(err, res){
                                if (err) return done(err);
                                res.body.should.have.property('balance').equal(100);
                                res.body.should.have.property("active").equal(true);
                                res.body.should.have.property('owner');
                                res.body.owner.should.have.property('name').equal('Lucianinho Junior');
                                done();
                            });
                      });
               });

        });

        it('Should return 200 and the log number', function(done){
            var newCard = {
                balance: 0
            };

            app.patch(CARD_RESOURCE+'102')
               .send(newCard)
               .set(headers)
               .expect(HTTP_SC_OK)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property('balance').equal(0);
                   res.body.should.have.property('owner');
                   res.body.should.have.property('logId');
                   res.body.owner.should.have.property('name').equal('Lucianinho Junior');
                   res.body.owner.should.have.property("cellphone").equal("(83)98827-2999");
                   res.body.should.have.property("active").equal(true);
                   app.get(CARD_RESOURCE+'102')
                      .set(headers)
                      .expect(HTTP_SC_OK)
                      .expect('Content-type', /json/)
                      .end(function(err, res){
                          if (err) return done(err);
                          res.body.should.have.property('balance').equal(0);
                          res.body.should.have.property('owner');
                          res.body.owner.should.have.property('name').equal('Lucianinho Junior');
                          res.body.should.have.property("active").equal(true);
                          res.body.owner.should.have.property("cellphone").equal("(83)98827-2999");
                          done();
                      });
               });
        });
    });

    describe('Setting card status to unactive and trying to execute operations after', function(){

        it('Should return 200 OK and return the object', function(done){
            var setUnactive = {
                active: false
            };
            app.patch(CARD_RESOURCE+'102')
               .set(headers)
               .send(setUnactive)
               .expect(HTTP_SC_OK)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property('owner');
                   res.body.should.have.property("active").equal(false);
                   res.body.should.have.property("logId");
                   var log = res.body.logId;
                   res.body.owner.should.have.property('name').equal('Lucianinho Junior');
                   var trying = {balance: 1000};
                   app.patch(CARD_RESOURCE+'102')
                      .set(headers)
                      .send(trying)
                      .expect(HTTP_SC_NOT_ACCEPTABLE)
                      .expect('Content-type', /json/)
                      .end(function(err, res){
                          if (err) return done(err);
                          res.body.should.have.property('error').equal('This card was deactived');
                          done();
                      });
               });
        });

        it('Should return 200 OK and return the object', function(done){
            var setUnactive = {
                active: false
            };
            app.patch(CARD_RESOURCE+'101')
               .set(headers)
               .send(setUnactive)
               .expect(HTTP_SC_OK)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property('owner');
                   res.body.should.have.property("active").equal(false);
                   res.body.should.have.property("logId");
                   var log = res.body.logId;
                   res.body.owner.should.have.property('name').equal('Lucianinho Junior');
                   var trying = {balance: 1000};
                   app.patch(CARD_RESOURCE+'101')
                      .set(headers)
                      .send(trying)
                      .expect(HTTP_SC_NOT_ACCEPTABLE)
                      .expect('Content-type', /json/)
                      .end(function(err, res){
                          if (err) return done(err);
                          res.body.should.have.property('error').equal('This card was deactived');
                          done();
                      });
               });
        });


    });

    describe('Making operations and checking the log object', function(){

        it('Should return the correct log object after making a operations', function(done){
            var op = {
                balance: 100
            };
            app.patch(CARD_RESOURCE+'100')
               .set(headers)
               .send(op)
               .expect(HTTP_SC_OK)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property('balance').equal(100);
                   res.body.should.have.property('owner');
                   res.body.owner.should.have.property('name').equal('Lucianinho Junior');
                   res.body.should.have.property('logId');
                   var log = res.body.logId;
                   app.get(LOG_RESOURCE+log)
                      .set(headers)
                      .expect(HTTP_SC_OK)
                      .expect('Content-type', /json/)
                      .end(function(err, res){
                          if (err) return done(err);
                          res.body.should.have.property('timestamp');
                          res.body.timestamp.should.be.a.type('number');
                          res.body.should.have.property('balanceBefore');
                          res.body.balanceBefore.should.be.a.type('number');
                          res.body.should.have.property('balanceAfter');
                          res.body.balanceAfter.should.be.a.type('number');
                          res.body.should.have.property('cardNumber');
                          res.body.cardNumber.should.be.a.type('string');
                          res.body.should.have.property('station');
                          res.body.should.have.property('type');
                          res.body.type.should.be.a.type('number');
                          done();
                      });
               });
        });

        it('Should return the correct log object after making a operation', function(done){
            var op = {
                balance: 100
            };
            app.patch(CARD_RESOURCE+'100')
               .set(headers)
               .send(op)
               .expect(HTTP_SC_OK)
               .expect('Content-type', /json/)
               .end(function(err, res){
                   if (err) return done(err);
                   res.body.should.have.property('balance').equal(100);
                   res.body.should.have.property('owner');
                   res.body.owner.should.have.property('name').equal('Lucianinho Junior');
                   res.body.should.have.property('logId');
                   var log = res.body.logId;
                   app.get(LOG_RESOURCE+log)
                      .set(headers)
                      .expect(HTTP_SC_OK)
                      .expect('Content-type', /json/)
                      .end(function(err, res){
                          if (err) return done(err);
                          res.body.should.have.property('timestamp');
                          res.body.timestamp.should.be.a.type('number');
                          res.body.should.have.property('balanceBefore');
                          res.body.balanceBefore.should.be.a.type('number');
                          res.body.should.have.property('balanceAfter');
                          res.body.balanceAfter.should.be.a.type('number');
                          res.body.should.have.property('cardNumber');
                          res.body.cardNumber.should.be.a.type('string');
                          res.body.should.have.property('station');
                          res.body.should.have.property('type');
                          res.body.type.should.be.a.type('number');
                          done();
                      });
               });
        });

    });

});