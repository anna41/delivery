const assert = require('chai').assert;
const chai = require('chai');
const asserttype = require('chai-asserttype');
chai.use(asserttype);
const app1 = require('../server/controllers/calculateOrdersDelivery');

//Results
//sayHelloResult = app1.sayHello();

describe("App",()=>{
    describe('checkIfTheAvailableDateIsUpToDate()',()=>{
        it('checkIfTheAvailableDateIsUpToDate() should return type Date',()=>{

            result = app1.checkIfTheAvailableDateIsUpToDate('kk');
            assert.typeOf(result,'Date');
        });   
    })
});