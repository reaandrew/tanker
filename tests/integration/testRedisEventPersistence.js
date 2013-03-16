var assert = require("assert");
var uuid = require("node-uuid");
var redis = require("redis");
var RedisEventStore = require("../../lib/infrastructure/RedisEventStore");

describe("Test Redis Event Persistence", function() {

    before(function() {
        this.redisClient = redis.createClient();
    });

    after(function() {
        this.redisClient.quit();
    });

    it("Should persist events", function(done) {
        var context = this;
        var aggregateId = uuid.v4();
        var events = [{
            id: aggregateId,
            version: 1,
            _eventName: "dummy"
        }, {
            id: aggregateId,
            version: 2,
            _eventName: "dummy"
        }];
        var redisEventStore = new RedisEventStore();
        redisEventStore.save(events, aggregateId, 0, function(err) {
            context.redisClient.hkeys(aggregateId, function(err, replies) {
                assert.equal(replies.length, 2);
                done();
            });
        });
    });

    it("Should retrieve all events for a given aggregate ID", function(done) {
        var context = this;
        var aggregateId = uuid.v4();
        var events = [{
            id: aggregateId,
            version: 1,
            _eventName:"dummy"
        }, {
            id : aggregateId,
            version : 2,
            _eventName:"dummy"
        }];
        context.redisClient.hset(aggregateId, events[0].version, JSON.stringify(events[0]),function(){
            context.redisClient.hset(aggregateId, events[1].version, JSON.stringify(events[1]), function(){
                var eventStore = new RedisEventStore();
                eventStore.get(aggregateId, function(err, events){
                    assert.equal(events.length, 2);
                    assert.equal(events[0].version, 1);
                    done();
                });
            });
        });
    });

    //Could not think of a better name for this test.  Need to ensure that we have optimistic concurrency.
    it("Should be syncronized", function(done) {
        done();
    });

});
