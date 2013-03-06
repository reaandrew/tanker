var util = require("util");
var assert = require("assert");
var uuid = require("node-uuid");

function AggregateRoot(options) {
    this.id = options.id;
    this.events = [];
    this.version = 0;
}

AggregateRoot.prototype.applyChange = function(event) {
    event.version = this.version++;
    this["handle_" + event._eventName].apply(this, [event]);
}

function NameChangedEvent(options) {
    this._eventName = NameChangedEvent.name;
    this.id = options.id;
    this.name = options.name;
}

function DummyAggregateRoot(options) {
    AggregateRoot.call(this, options);
}
util.inherits(DummyAggregateRoot, AggregateRoot);

DummyAggregateRoot.prototype.changeName = function(name) {
    this.applyChange(new NameChangedEvent({
        id: this.id,
        name: name
    }));
}

DummyAggregateRoot.prototype.handle_NameChangedEvent = function(event) {
    this.name = event.name;
};

describe("Test Aggregate Root", function() {

    before(function() {
        this.id = uuid.v4();
        this.testAgg = new DummyAggregateRoot({
            id: this.id
        });
    });

    it("Should initialize events", function() {
        assert.equal(this.testAgg.events.length, 0);
    });

    it("Should initialize version", function() {
        assert.equal(this.testAgg.version, 0);
    });

    it("Should initialize id from parameters", function() {
        assert.equal(this.testAgg.id, this.id);
    });

    it("Should apply a known event", function() {
        this.testAgg.changeName("Andy");
        assert.equal(this.testAgg.version, 1);
    });

});
