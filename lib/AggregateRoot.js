function AggregateRoot(options) {
    this.id = null;
    this.uncommittedEvents = [];
    this.version = 0;
    this.nextVersion = 0;

    if (options.events != null) {
        this.replay(options.events);
    } else {
        this.initialize(options);
    }
};

AggregateRoot.prototype.applyChange = function(event) {
    event.version = ++this.nextVersion;
    this.uncommittedEvents.push(event);
    this["handle_" + event._eventName].apply(this, [event]);
}

AggregateRoot.prototype.replay = function(events) {
    var that = this;
    events.forEach(function(event) {
        that.version = event.version;
        that["handle_" + event._eventName].apply(that, [event]);
    });
    this.nextVersion = this.version;
}

AggregateRoot.prototype.markAsCommitted = function(){
    this.uncommittedEvents = [];
    this.version = this.nextVersion;
}

module.exports = AggregateRoot;
