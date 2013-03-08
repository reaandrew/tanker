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

module.exports = AggregateRoot;
