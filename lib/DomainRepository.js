'use strict';

function DomainRepository(eventStore) {
    this.eventStore = eventStore;
}

DomainRepository.prototype.save = function(domainObject, callback) {
    this.eventStore.saveEvents(domainObject.uncommittedEvents, function() {
        domainObject.markAsCommitted();
        callback();
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
