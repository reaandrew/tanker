var assert = require("assert");
var uuid = require("node-uuid");
var sinon = require("sinon");
var DomainRepository = require("../lib/DomainRepository");
var DummyAggregateRoot = require("./support/DummyAggregateRoot");
var DummyAggregateRootCreatedEvent = require("./support/DummyAggregateRootCreatedEvent");
require("should");


describe("Test Domain Repository", function() {

    var eventStore;
    var eventPublisher;

    beforeEach(function(done) {
        eventStore = {
            saveEvents : sinon.stub(),
            getEvents : sinon.stub()
        };
        eventPublisher = {
            publish: function(evts, callback) {
                callback();
            }
        };
        done();
    });

    it("Should save an aggregate roots events to the event store", function(done) {
        var name = "SomeName";
        var id = uuid.v4();
        var root = new DummyAggregateRoot({
            id: id,
            name: name
        });
        eventStore.saveEvents.callsArg(1);
        var domainRepository = new DomainRepository(eventStore, eventPublisher);
        domainRepository.save(root, function() {
            var aggRoot = eventStore.saveEvents.getCall(0).args[0];
            aggRoot.should.eql(root);
            done();
        });
    });

    it("Should get an object by building it from its events", function(done) {
        var id = uuid.v4();
        var name = "Something";
        var version = 1;
        var event = new DummyAggregateRootCreatedEvent({
            id: id,
            name: name,
            version: version
        });
        eventStore.getEvents.callsArgWith(1, null, [event]);
        var domainRepository = new DomainRepository(eventStore, eventPublisher);
        domainRepository.get(DummyAggregateRoot, id, function(object) {
            assert.equal(object.version, 1);
            done();
        });
    });

});
