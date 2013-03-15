var redis = require("redis");
var async = require("async");
var _ = require("underscore");

function RedisEventStore() {
    this.redisClient = redis.createClient();
};


RedisEventStore.prototype.save = function(events, aggregateId, expectedVersion, callback) {
    var context = this;

    function saveEvent(event, callback){
        context.redisClient.hset(event.id, event.version, event, function(err, reply){
            callback(err,reply);
        });
    }
    
    async.each(events, saveEvent, function(err){
        context.redisClient.quit();
        callback(err);
    });
}

module.exports = RedisEventStore;
