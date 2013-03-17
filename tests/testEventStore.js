var sinon = require("sinon");
var uuid = require("node-uuid");
var assert = require("assert");
var EventStore = require("../lib/EventStore");

describe("Test Event Store", function() {

    beforeEach(function() {
        this.eventPersistence = {
            get: sinon.stub()
        };
        this.eventStore = new EventStore(this.eventPersistence);
    });

    it("Should return events in ascending order of version", function() {
        var testEvents = [{
            version: 2,
            _eventName: "dummy"
        }, {
            version: 1,
            _eventName: "dummy"
        }]
        this.eventPersistence.get.callsArgWith(1,null,testEvents);
        var expected = [testEvents[1],testEvents[0]];
        this.eventStore.getEvents(uuid.v4(), function(err, events){
            assert.deepEqual(events, expected);
        });
    });
});
