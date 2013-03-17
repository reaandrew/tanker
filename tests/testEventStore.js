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
        this.eventStore = new EventStore(this.eventPersistence);
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
        this.eventPersistence = {
            save: function(events, aggregateId, expectedVersion, callback){
               events.forEach(function(event){
                    context.events.push(event);
               });
               callback(null);
            }
        };
        this.eventStore = new EventStore(this.eventPersistence);
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
});
