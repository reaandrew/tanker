var util = require("util");
var assert = require("assert");
var uuid = require("node-uuid");

function AggregateRoot() {
    this.id = null;
    this.uncommittedEvents = [];
    this.version = 0;
};

AggregateRoot.prototype.applyChange = function(event) {
    event.version = ++this.version;
    this.uncommittedEvents.push(event);
    this["handle_" + event._eventName].apply(this, [event]);
}

function DummyAggregateRootCreatedEvent(options){
    this._eventName = DummyAggregateRootCreatedEvent.name;
    this.id = options.id;
    this.name = options.name;
};

function NameChangedEvent(options) {
    this._eventName = NameChangedEvent.name;
    this.id = options.id;
    this.name = options.name;
};

function DummyAggregateRoot(options) {
    AggregateRoot.call(this);
    this.applyChange(new DummyAggregateRootCreatedEvent({
        id : options.id,
        name : options.name
    }));
};

util.inherits(DummyAggregateRoot, AggregateRoot);

DummyAggregateRoot.prototype.handle_DummyAggregateRootCreatedEvent = function(event){
    this.id = event.id;
    this.name = event.name;
}


describe("Test Aggregate Root", function() {
    beforeEach(function() {
        this.id = uuid.v4();
        this.name = "Something";
        this.testAgg = new DummyAggregateRoot({
            id: this.id,
            name : this.name
        });
    });

    it("Should initialize id from parameters", function() {
        assert.equal(this.testAgg.id, this.id);
    });

    it("Should increment the version of the AggregateRoot after handling a known event", function() {
        assert.equal(this.testAgg.version, 1);
    });

    it("Should add the event being handled to the AggregateRoots list of uncommitted events", function(){
        assert.equal(this.testAgg.uncommittedEvents.length, 1);
    });

    it("Should assign the version of the AggregateRoot to the event being handled", function(){
        var event = this.testAgg.uncommittedEvents[0];
        assert.equal(event.version, 1);
    });
});
