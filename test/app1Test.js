const assert = require('chai').assert;
const chai = require('chai');
const expect = chai.expect;
const asserttype = require('chai-asserttype');
chai.use(asserttype);
chai.use(require('chai-like'));
chai.use(require('chai-things'));
const app1 = require('../server/controllers/calculateOrdersDelivery');



describe("App",()=>{
    describe('checkIfTheAvailableDateIsUpToDate(date)',()=>{
        it('should return type Date',()=>{

            result = app1.checkIfTheAvailableDateIsUpToDate("2018-04-03T19:57:12.043Z");
            assert.typeOf(result,'Date');
        });  
        
        it('for old date should return Date.now()',()=>{

            result = app1.checkIfTheAvailableDateIsUpToDate("2017-04-03T19:57:12.043Z");
            assert.equal(new Date(result).getTime(),new Date(Date.now()).getTime());
        });

        it('for future date should return the same date',()=>{

            result = app1.checkIfTheAvailableDateIsUpToDate("2019-04-03T19:57:12.043Z");
            assert.equal(result.getTime(),new Date("2019-04-03T19:57:12.043Z").getTime());
        });
    })

    describe(' deleteAddedOrders(orders,orderIds)',()=>{

        let orders = [{
            "_id" : "5aa697dfd7060e3937697333",
            "price" : 200,
            "status" : "in the store"
        },{"_id" : "5aa697dfd7060e3937697334",
        "price" : 200,
        "status" : "in the store"},
        {"_id" : "5aa697dfd7060e3937697335",
        "price" : 200,
        "status" : "in the store"},
        {"_id" : "5aa697dfd7060e3937697336",
        "price" : 200,
        "status" : "in the store"}];

        let orderIds = ["5aa697dfd7060e3937697336","5aa697dfd7060e3937697335"];

        it('should return array',()=>{

            result = app1.deleteAddedOrders(orders,orderIds);
            assert.isArray(result);
        }); 

        it('should return orders without ordersIds',()=>{

            result = app1.deleteAddedOrders(orders,orderIds);
            console.log(result)
            orderIds.forEach(element => {
               expect(result).to.be.an('array').that.not.contains.something.like({"_id":element});
            });
        }); 
    })
});