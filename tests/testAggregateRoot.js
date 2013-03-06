var util = require("util");
var assert = require("assert");
var uuid = require("node-uuid");

function AggregateRoot(options){
    this.id = options.id;
    this.events = [];
    this.version = 0;
}

function DummyAggregateRoot(options){
    AggregateRoot.call(this, options);
}

util.inherits(DummyAggregateRoot, AggregateRoot);

describe("Test Aggregate Root", function(){

    before(function(){
        this.id = uuid.v4();
        this.testAgg = new DummyAggregateRoot({id:this.id});
    });

    it("Should initialize events", function(){
        assert.equal(this.testAgg.events.length,0);
    });

    it("Should initialize version", function(){
        assert.equal(this.testAgg.version, 0);
    });

    it("Should initialize id from parameters", function(){
        assert.equal(this.testAgg.id, this.id);
    });

});
