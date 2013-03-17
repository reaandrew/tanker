var sinon = require("sinon");
var uuid = require("node-uuid");
var assert = require("assert");
var EventStore = require("../lib/EventStore");

describe("Test Event Store Getting Events", function() {

    beforeEach(function() {
        this.eventPersistence = {
            get: sinon.stub(),
            save: sinon.stub()
        };
        this.eventPublisher = {
            publish : sinon.spy()
        };
        this.eventStore = new EventStore(this.eventPersistence, this.eventPublisher);
    });

    it("Should return events in ascending order of version", function(done) {
        var testEvents = [{
            version: 2,
            _eventName: "dummy"
        }, {
            version: 1,
            _eventName: "dummy"
        }]
        this.eventPersistence.get.callsArgWith(1, null, testEvents);
        var expected = [testEvents[1], testEvents[0]];
        this.eventStore.getEvents(uuid.v4(), function(err, events) {
            assert.deepEqual(events, expected);
            done();
        });
    });

});

describe("Test Event Store Saving Events", function() {

    beforeEach(function(done){
        var context = this;
        this.events = [];
        this.eventsPublished = [];
        this.eventPersistence = {
            save: function(events, aggregateId, expectedVersion, callback){
               events.forEach(function(event){
                    context.events.push(event);
               });
               callback(null);
            }
        };
        this.eventPublisher = {
            publish : function(event, callback){
                context.eventsPublished.push(event);
                callback(null);
            }
        }
        this.eventStore = new EventStore(this.eventPersistence, this.eventPublisher);
        done();
    });

    it("Should save events to the event store", function(done) {
        var context = this;
        var aggregateId = uuid.v4();
        var eventsToSave = [{
            version: 1,
            _eventName: "dummy"
        }];
        this.eventStore.saveEvents(eventsToSave, aggregateId, 0, function(err){
            assert.deepEqual(eventsToSave, context.events);
            done();
        });
    });

    it("Should publish events to the event publisher", function(done){
        var context = this;
        var aggregateId = uuid.v4();
        var eventsToSave = [{
            version: 1,
            _eventName: "dummy"
        }];
        this.eventStore.saveEvents(eventsToSave, aggregateId, 0, function(err){
            assert.deepEqual(eventsToSave, context.eventsPublished);
            done();
        });
    });

    it("Should not publish events when there was an error saving the events to the persistence", function(done){
        var context = this;
        var aggregateId = uuid.v4();
        var eventsToSave = [{
            version: 1,
            _eventName: "dummy"
        }];

        this.eventPersistence = {
            save : function(events, aggregateId, expectedVersion, callback){
                callback("BANG");
            }
        };
        this.eventStore = new EventStore(this.eventPersistence, this.eventPublisher);
        this.eventStore.saveEvents(eventsToSave, aggregateId, 0, function(err){
            assert.equal(context.eventsPublished.length, 0);
            done();
        });
    });
});
