var util = require("util");
var redis = require("redis");
var async = require("async");
var _ = require("underscore");

function RedisEventStore() {
    this.redisClient = redis.createClient();
};


RedisEventStore.prototype.save = function(events, aggregateId, expectedVersion, callback) {
    var context = this;

    function saveEvent(event, callback){
        context.redisClient.hset(event.id, event.version, JSON.stringify(event), function(err, reply){
            callback(err,reply);
        });
    };
    
    async.each(events, saveEvent, function(err){
        callback(err);
    });
}

RedisEventStore.prototype.get = function(aggregateId, callback){
    var context = this;
    var events = [];
    
    function getEvent(key, callback){
        context.redisClient.hget(aggregateId, key, function(err, reply){
            events.push(JSON.parse(reply));
            callback(err);    
        });
    };
    /*
    context.redisClient.hkeys(aggregateId, function(err, replies){
        async.each(replies, getEvent, function(err){
            callback(err,events);
        });
    });
    */
    context.redisClient.hgetall(aggregateId, function(err, reply){
        _.each(reply, function(event){
            events.push(JSON.parse(event));
        });
        callback(err, events);
    });
}

module.exports = RedisEventStore;
