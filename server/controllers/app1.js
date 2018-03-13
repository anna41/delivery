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
 Cars.findOneAndUpdate({status:false},{ $set: { order_id: orderId,status:true,finish_time: finishTime} },{new:true})
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





// function calculateEstimatedTime(){
//   var orderResult; 
//   var counterForOrder=0;
//   var counterForCars=0;
//   var estimatedTime=[];    
//   var counter=0;
//   var orderCount=0;
//   var promiseArray=[];
//   return Order.find({'status':'in the store'})
//     .sort({date: 1})
//     .then(data => {
//       if(!data)
//        return;
//       orderCount=data.length;
//       orderResult = data;
//       return Cars.find({'status':true});    
//     })
//     .then(cars =>{
//       if(!cars)
//        return;
//       cars.forEach(car=>{
//         estimatedTime[counter]=car.finish_time;
//         counter++;
//       }) 
//     })
//     .then(()=>{
//       return Cars.find({'status':false});
//     })
//     .then(cars => {
//       var carsCount;
//        carsCount = cars.length;
//        orderResult.forEach(order => {
//          if(counterForCars!=carsCount){
//           estimatedTime[counter] = new Date(+Date.now()+order.time.value*1000);
//           promiseArray.push(Order.findOneAndUpdate({"_id":  order._id}, { $set:{ "arrivalDate":  estimatedTime[counterForOrder]}},{new:true}));
//           counter++;
//           counterForCars++;
//           counterForOrder++;
//          }
//        })
//        return estimatedTime;
//     })
//     .then((estTime)=>{
//       while(counterForOrder!=orderCount){
//         estTime.sort((a, b) => a - b);
//         estTime[0] =new Date(+new Date(estTime[0])+orderResult[counterForOrder].time.value*1000);
//         promiseArray.push(Order.findOneAndUpdate({"_id":  orderResult[counterForOrder]._id}, { $set:{ "arrivalDate":  estTime[0]}},{new:true}));
//        counterForOrder++; 
//       }
//       return Promise.all( promiseArray);
//     })   
// }

function calculateEstimatedTime(){
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
        carsResult.sort((a, b) => a.finish_time - b.finish_time);
        if(carsResult[0].finish_time==null)
          estimatedTime = new Date(+Date.now()+Number(order.time.value)*1000);
        else
          estimatedTime=new Date(+carsResult[0].finish_time+Number(order.time.value)*1000);
        carsResult[0].finish_time=estimatedTime;
        promiseArray.push(Order.findOneAndUpdate({"_id":  order._id}, { $set:{ "arrivalDate":  estimatedTime}},{new:true}));
      });
      return Promise.all(promiseArray);
    })  
}

function getArrivalTime(orderId){
  return calculateEstimatedTime()
  .then((data)=>{ 
    data.forEach(order => {
      if(orderId==undefined){  
      console.log("for chosen odrer id: ", order._id, "arrival date is ",order.arrivalDate); 
      }
      else{
        if(order._id==orderId)
        console.log("for one chosen odrer id: ", order._id, "arrival date is ",order.arrivalDate);      
      }      
    })
  })
}


getArrivalTime('5aa697339c9fdd6ae1f0da26');
getArrivalTime();

db.close();
  });
  });
}