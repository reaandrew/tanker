'use strict';

function DummyAggregateRootCreatedEvent(options) {
    this._eventName = DummyAggregateRootCreatedEvent.name;
    this.id = options.id;
    this.name = options.name;
    this.version = options.version;
}

module.exports = DummyAggregateRootCreatedEvent;
