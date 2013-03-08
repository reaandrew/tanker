var util = require("util");
var assert = require("assert");
var uuid = require("node-uuid");
var sinon = require("sinon");
var DummyAggregateRoot = require("./support/DummyAggregateRoot");
var DummyAggregateRootCreatedEvent = require("./support/DummyAggregateRootCreatedEvent");

function DomainRepository(eventStore) {
    this.eventStore = eventStore;
}

DomainRepository.prototype.save = function(domainObject, callback) {
    this.eventStore.saveEvents(domainObject.uncommittedEvents, function(){
        domainObject.markAsCommitted();
        callback();
    });
}

DomainRepository.prototype.get = function(proto, id, callback){
    this.eventStore.getEvents(id, function(events){
        var root = new proto({
            events : events
        });
        callback(root);
    });
}

describe("Test Domain Repository", function() {

    it("Should save an aggregate roots events to the event store", function(done) {
        var name = "SomeName";
        var id = uuid.v4();
        var root = new DummyAggregateRoot({
            id: id,
            name: name
        });
        var eventStore = {
            saveEvents: sinon.stub()
        };
        eventStore.saveEvents.callsArg(1);
        var domainRepository = new DomainRepository(eventStore);
        domainRepository.save(root, function() {
            var events = eventStore.saveEvents.getCall(0).args[0];
            var event = events[0];
            assert.equal(event.id, id);
            assert.equal(event.name, name);
            assert.equal(event.version, 1);
            assert.equal(root.uncommittedEvents.length, 0);
            done();
        });
    });

    it("Should get an object by building it from its events", function(done) {
        var id = uuid.v4();
        var name = "Something";
        var version = 1;
        var event = new DummyAggregateRootCreatedEvent({
            id : id,
            name : name,
            version : version
        });
        var eventStore = {
            getEvents : sinon.stub()
        }
        eventStore.getEvents.callsArgWith(1,[event]);
        var domainRepository = new DomainRepository(eventStore);
        domainRepository.get(DummyAggregateRoot, id, function(object){
            assert.equal(object.version, 1);
            done();
        });
    });

});
