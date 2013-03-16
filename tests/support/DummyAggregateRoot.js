var util = require("util");
var DummyAggregateRootCreatedEvent = require("./DummyAggregateRootCreatedEvent");
var AggregateRoot = require("../../lib/AggregateRoot");

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

module.exports = DummyAggregateRoot;
