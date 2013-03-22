var rabbit = require("rabbit.js");
var assert = require("assert");
var RabbitEventPublisher = require("../../lib/infrastructure/RabbitEventPublisher");

describe("Test rabbit event publisher", function() {

    it("Should publish event", function(done) {
        var host = "amqp://localhost";
        var eventName = "DummyEvent";

        var eventToPublish = {
            version: 1,
            _eventName: eventName
        }
        var rabbitContext = rabbit.createContext(host);
        rabbitContext.on("ready", function() {
            var publisher = new RabbitEventPublisher(rabbitContext);
            var subSocket = rabbitContext.socket("SUB");
            subSocket.connect(eventName, function() {
                subSocket.setEncoding("utf8");
                subSocket.on("data", function(jsonEvent) {
                    var event = JSON.parse(jsonEvent);
                    assert.equal(event.version, 1);
                    done();
                });
                publisher.publish(eventToPublish, function(err) {
                    
                });
            });
        });


    });

});
