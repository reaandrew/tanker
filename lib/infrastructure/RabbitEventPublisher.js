var rabbit = require("rabbit.js");

function RabbitEventPublisher(context){
    this.context = context;
};

RabbitEventPublisher.prototype = {
    publish : function(event, callback){
        var pubSocket = this.context.socket("PUB");
        pubSocket.connect(event._eventName, function(){
            pubSocket.write(JSON.stringify(event), "utf8");
            callback(null);
        });
    }   
}

module.exports = RabbitEventPublisher;
