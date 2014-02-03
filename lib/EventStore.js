'use strict';

var _ = require("underscore");
var async = require("async");

function EventStore(eventPersistence, eventPublisher) {
    this.eventPersistence = eventPersistence;
    this.eventPublisher = eventPublisher;
}

EventStore.prototype.getEvents = function(aggregateId, callback) {
    this.eventPersistence.get(aggregateId, function(err, events) {

        var sortedEvents = _.sortBy(events, function(evt) {
            return evt.version;
        });

        callback(err, sortedEvents);
    });
};

EventStore.prototype.saveEvents = function(events, aggregateId, expectedVersion, callback) {
    var context = this;
    this.eventPersistence.save(events, aggregateId, expectedVersion, function(err) {
        if (err == null) {
            async.each(events, function(event, taskCallback) {
                context.eventPublisher.publish(event, taskCallback);
            }, function(err) {
                callback(err);
            });
        } else {
            callback(err);
        }
    });
};

module.exports = EventStore;
