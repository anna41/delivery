var ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://Anna2:Aa12345@ds247078.mlab.com:47078/delivery';
var cron = require('node-cron');
var CronJob = require('cron').CronJob;
var mongoose = require("mongoose");
var mongooseSchema = require('./schema');
var Promise = require('promise');


module.exports = (app) => {
  app.get('/data', function(req, res) {

 MongoClient.connect(MONGO_URL, (err, db) => {  
 mongoose.connect(MONGO_URL);
 var Order = mongoose.model("Order",mongooseSchema.orderScheme,"order");
 var Cars = mongoose.model("Cars", mongooseSchema.carScheme);


//add new car
/*
var car = new Cars({
});
car.save(function(err){
     
  mongoose.disconnect();
  if(err) return console.log(err);
   
  console.log("Saved", car);
});
      if (err) {
        return console.log(err);
      }
 */     
/*
Cars.update({"status": true}, { "status":false}, { multi: true }).exec();
*/
/*
Order.update({"status":  "in the store"}, { "time":{"value":"100000"} }, { multi: true },function(err,res){console.log("Done")});
*/

function send_a_car(orderId,time_){
  var finishTime = new Date(Date.now()+Number(time_));
  console.log(orderId,'time: ',finishTime);
  var car;
 return Cars.findOneAndUpdate({status:false},{ $set: { order_id: orderId,status:true,finish_time: finishTime} },{new:true})
 .then(carResult =>{ 
   if(carResult==null)
    return;
   car=carResult;
   console.log("finding a car");
   console.log(finishTime);
   return Order.findOneAndUpdate({"_id":  orderId}, { "status": 'on the way'}, { multi: true });
  })
  .then(orderResult=>{
    console.log('1');
    console.log("time: ",finishTime);
  var job = new CronJob(finishTime, function() {
    Order.findOneAndUpdate({"_id":  orderResult._id}, { $set:{ "status": 'delivered'}},{new:true}).exec();
    Cars.findOneAndUpdate({"_id": car._id}, { $set:{ order_id: null,status:false,finish_time:null}},{new:true}).exec();
    });
  job.start();
  });
}

// cron.schedule('* * * * *', function(){
//   console.log('running a task every minute');
//   Cars.find({status:false})
//   .then(carsResult=> {
//     var carCount = carsResult.length;
//     console.log("car count: ",carCount);
//     if(carCount==0)
//      return;
//     else
//      return Order.find({"status": 'in the store'}).sort({date: 1}).limit(carCount)
//   })
//   .then(orderResult=> {  
//       if(!orderResult)
//         return;
//         console.log("count of orders:");
//         console.log(orderResult.length);
//         orderResult.forEach(order => {
//             console.log("/////////");              
//              console.log(order._id);
//             send_a_car(order._id,order.time.value);       
//       });      
//   });
// });

function calculateEstimatedTime(){
  console.log('1');
  var orderResult;
  return Order.find({'status':'in the store'}).sort({date: 1})
    .then(orders=>{
      orderResult=orders;
    })
    .then(()=>{
      return Cars.find();
    })
    .then(carsResult=>{
      var promiseArray=[];
      var estimatedTime;
      orderResult.forEach(order => {
        //console.log(order._id,' ',order.date,' ',order.time.text);
        carsResult.sort((a, b) => a.finish_time - b.finish_time);
        estimatedTime=getEstimate(carsResult[0].finish_time,order.time.value);
        carsResult[0].finish_time=estimatedTime;
        promiseArray.push(Order.findOneAndUpdate({"_id":  order._id}, { $set:{ "arrivalDate":  estimatedTime}},{new:true}));
      });
      console.log('5');
      return Promise.all(promiseArray);
    })
    .catch(function (error) {
      console.log('an error occurred');
    });
}

function getEstimate(finishTime,orderTime){
  if(finishTime==null)
    estimatedTime = new Date(+Date.now()+Number(orderTime)*1000);
  else
    estimatedTime = new Date(+finishTime+Number(orderTime)*1000);
  return estimatedTime;      
}

function getArrivalTime(orderId){
  if(orderId){
    Order.findOne({'_id':orderId})
    .then(orderResult=>{
      if(orderResult==null){
        console.log('sorry, the order with such id does not exist.');
        return;
      }
      if(orderResult.status=="delivered"){
       console.log('the order ',orderResult._id, 'already delivered');
       return;
      }
      if(orderResult.arrivalDate){
        console.log("for odrer id: ", orderResult._id, "arrival date is ",orderResult._id);
      }
      else{
        return calculateEstimatedTime()
        .then((data)=>{
          data.some(order => {
            if(order._id==orderId){
              console.log("for odrer id: ", order._id, "arrival date is ",order._id);
              }
          })
        });
      }
    })
  }
}

getArrivalTime("5aa697339c9fdd6ae1f0da26");

function getArrivalTimeForAll(){
  return calculateEstimatedTime()
  .then((data)=>{
    return Order.find();
  })
  .then(orders=>{
    orders.forEach(order => {
      getArrivalTime(order._id);
    });
  })
}

//getArrivalTimeForAll();




// function getArrivalTime(orderId){
//   console.log('1');
//   return calculateEstimatedTime()
//   .then((data)=>{ 
//     console.log('2');
//     data.forEach(order => {
//       showOrdersArrivalDate(order._id,order.arrivalDate,orderId);   
//     })
//   })
// }

// function checkIfArrivalDateIsNull(orderId){ //true if some order has null value
//   var timeIsNull=false;
//   return Order.find()
//   .then((orders)=>{
//     if(orderId==undefined){
//       timeIsNull = orders.some(order=>{return order.arrivalDate==null});
//     }
//     else{
//       timeIsNull = orders.some(order=>String(order._id)==orderId && order.arrivalDate==null);
//     }
//      console.log(timeIsNull);
//     return timeIsNull;
//   })
// }

// function showOrdersArrivalDate(id,arrivalDate,orderId){
//   if(orderId==undefined){
//     console.log("for chosen odrer id: ", id, "arrival date is ",arrivalDate); 
//     }
//     else{
//       if(id==orderId)
//       console.log("for one chosen odrer id: ", id, "arrival date is ",arrivalDate);      
//     }
// }

// function getArrivalTime(orderId){
//   var checkNullValue =checkIfArrivalDateIsNull(orderId);
//   checkNullValue.then((chekedValue)=>{
//     if(chekedValue){
//       return calculateEstimatedTime()
//       .then((data)=>{
//         data.forEach(order => {
//           showOrdersArrivalDate(order._id,order.arrivalDate,orderId);
//         })
//       })
//     }
//     else{
//       Order.find({$or:[{'status':'in the store'},{'status':'on the way'}]})
//       .then(orders=>{
//         orders.forEach(order => {
//           showOrdersArrivalDate(order._id,order.arrivalDate,orderId);
//         })
//       })
//     }
//   })
// }

db.close();
  });
  });
}