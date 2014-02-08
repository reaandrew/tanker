'use strict';

function DomainRepository(eventStore, eventPublisher) {
    this.eventStore = eventStore;
    this.eventPublisher = eventPublisher;
}

DomainRepository.prototype.save = function(domainObject, callback) {
    var context = this;
    this.eventStore.saveEvents(domainObject, function() {
        context.eventPublisher.publish(domainObject.uncommittedEvents, function() {
            domainObject.markAsCommitted();
            callback();
        });
    });
};

DomainRepository.prototype.get = function(proto, id, callback) {
    var ClassToInstantiate = proto;
    this.eventStore.getEvents(id, function(err, events) {
        var root = new ClassToInstantiate({
            events: events
        });
        callback(root);
    });
};

module.exports = DomainRepository;
