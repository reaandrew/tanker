
module.exports = exports = {
    AggregateRoot : require("./AggregateRoot"),
    DomainRepository : require("./DomainRepository"),
    EventStore : require("./EventStore"),

    infrastructure : {
        RedisEventStore : require("./infrastructure/RedisEventStore")
    }
}

