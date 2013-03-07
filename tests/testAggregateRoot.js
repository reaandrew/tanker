var util = require("util");
var assert = require("assert");
var uuid = require("node-uuid");
var _ = require("underscore");

function AggregateRoot(options) {
    this.id = null;
    this.uncommittedEvents = [];
    this.version = 0;

    if (options.events != null) {
        this.replay(options.events);
    } else {
        this.initialize(options);
    }
};

AggregateRoot.prototype.applyChange = function(event) {
    event.version = ++this.version;
    this.uncommittedEvents.push(event);
    this["handle_" + event._eventName].apply(this, [event]);
}

AggregateRoot.prototype.replay = function(events) {
    var that = this;
    _.each(events, function(event) {
        that.version = event.version;
        that["handle_" + event._eventName].apply(that, [event]);
    });
}

AggregateRoot.prototype.markAsCommitted = function(){
    this.uncommittedEvents = [];
}

function DummyAggregateRootCreatedEvent(options) {
    this._eventName = DummyAggregateRootCreatedEvent.name;
    this.id = options.id;
    this.name = options.name;
    this.version = options.version;
};

function DummyAggregateRoot(options) {
    AggregateRoot.call(this, options);
};

util.inherits(DummyAggregateRoot, AggregateRoot);

DummyAggregateRoot.prototype.initialize = function(options) {
    if (options.id == null) {
        throw new Error("ID is required");
    }
    if (options.name == null) {
        throw new Error("Name is required");
    }
    this.applyChange(new DummyAggregateRootCreatedEvent({
        id: options.id,
        name: options.name
    }));
}

DummyAggregateRoot.prototype.handle_DummyAggregateRootCreatedEvent = function(event) {
    this.id = event.id;
    this.name = event.name;
}


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
            assert.equal(this.testAgg.version, 1);
        });

        it("Should add the event being handled to the AggregateRoots list of uncommitted events", function() {
            assert.equal(this.testAgg.uncommittedEvents.length, 1);
        });

        it("Should assign the version of the AggregateRoot to the event being handled", function() {
            var event = this.testAgg.uncommittedEvents[0];
            assert.equal(event.version, 1);
        });
    });

    describe("Test Replaying Events on the AggregateRoot", function() {

        it("Should assign the version of the event to the aggregate root", function() {
            var id = uuid.v4();
            var name = "SomeName";
            var version = 1;
            var events = [
            new DummyAggregateRootCreatedEvent({
                id: id,
                name: name,
                version: version
            })];
            var testAgg = new DummyAggregateRoot({
                events: events
            });
            assert.equal(testAgg.version, version);
        });
    });
});
