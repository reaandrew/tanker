var assert = require("assert");
var uuid = require("node-uuid");
var DummyAggregateRoot = require("./support/DummyAggregateRoot");
var DummyAggregateRootCreatedEvent = require("./support/DummyAggregateRootCreatedEvent");

describe("Test Aggregate Root", function() {

    it("Should remove all uncommitted events when marked as committed", function() {
        this.id = uuid.v4();
        this.name = "Something";
        this.testAgg = new DummyAggregateRoot({
            id: this.id,
            name: this.name
        });

        this.testAgg.markAsCommitted();
        assert.equal(this.testAgg.uncommittedEvents.length, 0);
    });

    describe("Test Creating an AggregateRoot", function() {
        beforeEach(function() {
            this.id = uuid.v4();
            this.name = "Something";
            this.testAgg = new DummyAggregateRoot({
                id: this.id,
                name: this.name
            });
        });

        it("Should initialize id from parameters", function() {
            assert.equal(this.testAgg.id, this.id);
        });

        it("Should increment the version of the AggregateRoot after handling a known event", function() {
            assert.equal(this.testAgg.nextVersion, 1);
        });

        it("Should add the event being handled to the AggregateRoots list of uncommitted events", function() {
            assert.equal(this.testAgg.uncommittedEvents.length, 1);
        });

        it("Should assign the version of the AggregateRoot to the event being handled", function() {
            var event = this.testAgg.uncommittedEvents[0];
            assert.equal(event.version, 1);
        });

        it("Should assign the next version to the actual version once the aggregate root is committed", function(){
           this.testAgg.markAsCommitted();
           assert.equal(this.testAgg.version, 1);
        });
    });

    describe("Test Replaying Events on the AggregateRoot", function() {

        beforeEach(function(){
            this.version = 1;
            var id = uuid.v4();
            var name = "SomeName";
            var events = [
            new DummyAggregateRootCreatedEvent({
                id: id,
                name: name,
                version: this.version
            })];
            this.testAgg = new DummyAggregateRoot({
                events: events
            });
        });

        it("Should assign the version of the event to the aggregate root", function() {
            assert.equal(this.testAgg.version, this.version);
        });

        it("Should assign the version to the next version for further events to be applied", function(){
            assert.equal(this.testAgg.nextVersion, this.version);
        });
    });
});
