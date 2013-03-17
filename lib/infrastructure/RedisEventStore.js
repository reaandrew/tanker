var util = require("util");
var redis = require("redis");
var async = require("async");
var _ = require("underscore");

function RedisEventStore() {
    this.redisClient = redis.createClient();
};

RedisEventStore.prototype = {

    save: function(events, aggregateId, expectedVersion, callback) {
        var checkKey = "AR:" + aggregateId;
        var context = this;
        context.redisClient.watch(checkKey);
        context.redisClient.get(checkKey, function(err, reply) {
            var currentVersion = reply == null ? 0 : reply;
            if (currentVersion != expectedVersion) {
                throw new Error("Concurrency Exception");
            }
            var multi = context.redisClient.multi();

            _.each(events, function(event) {
                multi.hset(event.id, event.version, JSON.stringify(event));
            });

            var nextVersion = _.max(events, function(event) {
                return event.version;
            });

            multi.set(checkKey, nextVersion);
            multi.exec(function(err, replies) {
                callback(err);
            });
        });
    },

    get: function(aggregateId, callback) {
        var context = this;
        var events = [];

        function getEvent(key, callback) {
            context.redisClient.hget(aggregateId, key, function(err, reply) {
                events.push(JSON.parse(reply));
                callback(err);
            });
        };
        context.redisClient.hgetall(aggregateId, function(err, reply) {
            _.each(reply, function(event) {
                events.push(JSON.parse(event));
            });
            callback(err, events);
        });
    }
}

module.exports = RedisEventStore;
