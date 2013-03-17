var _ = require("underscore");

function EventStore(eventPersistence){
    this.eventPersistence = eventPersistence;
};

EventStore.prototype.getEvents = function(aggregateId, callback){
    this.eventPersistence.get(aggregateId, function(err, events){

        var sortedEvents =  _.sortBy(events, function(event){return event.version;});

        callback(err, sortedEvents);
    });
}

module.exports = EventStore;
