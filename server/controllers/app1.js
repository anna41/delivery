var ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://Anna2:Aa12345@ds247078.mlab.com:47078/delivery';
var cron = require('node-cron');
var CronJob = require('cron').CronJob;
var mongoose = require("mongoose");
var mongooseSchema = require('./schema');
var Promise = require('promise');
var _ = require('lodash');


module.exports = (app) => {
  app.get('/data', function(req, res) {

 MongoClient.connect(MONGO_URL, (err, db) => {  
 mongoose.connect(MONGO_URL);
 var Order = mongoose.model("Order",mongooseSchema.orderScheme,"order");
 var Cars = mongoose.model("Cars", mongooseSchema.carScheme);


//add new car

// var car = new Cars({
// });
// car.save(function(err){
     
//   mongoose.disconnect();
//   if(err) return console.log(err);
   
//   console.log("Saved", car);
// });
//       if (err) {
//         return console.log(err);
//       }
    
/*
Cars.update({"status": true}, { "status":false}, { multi: true }).exec();
*/
/*
Order.update({"status":  "in the store"}, { "time":{"value":"100000"} }, { multi: true },function(err,res){console.log("Done")});
*/

function sendCar(orderId,time_){
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
//             sendCar(order._id,order.time.value);       
//       });      
//   });
// });

function getFirstAvailableCar(){
  return Cars.find({'active':true})
  .then(cars=>{
    cars = _.orderBy(cars, ['availableTime'], ['asc']);
    console.log(cars);
    return Promise.resolve(cars[0]);
  })  
}

function getEstimateForOrder(orderId){
  return Order.findOne({"_id":orderId})
  .then(order=>{
    return order.arrivalDate;
  })
}

function getAllOrdersId(){
  return Order.find()
  .then(orders=>{
    var ordersId=[];
    orders.forEach(order => {
      ordersId.push(order._id);
    });
    return ordersId;
  })
}

function getEstimateForOrders(ordersId){
  var ordersEstimate=[];
  return (new Promise(resolve=> {
    if(!ordersId){
      getAllOrdersId()
      .then(
        resolve
      )
    }
    else{
      resolve(ordersId);
    }
  }))
  .then(ordersId=>{
    ordersId.forEach(orderId => {
      ordersEstimate.push(getEstimateForOrder(orderId));
    });
    return ordersEstimate;
  }) 
}
 

//getEstimateForOrders();
//getEstimateForOrders(["5aa697339c9fdd6ae1f0da26","5aa697dfd7060e393769783c"]);


function getOrderStatus(orderId){
  Order.findOne({"_id":orderId})
  .then(order=>{
    return order.status;
  })
}

function checkIfTheAvailableDateIsUpToDate(carDate){
  var nowDate =new Date(Date.now());
    if(carDate<nowDate)
     carDate = nowDate;
    return carDate;
}

function getOrderTime(orderId){
  return Order.findOne({"_id":orderId})
  .then(order=>{
    return order.time.value;
  })
}

function setEstimateForNewOrder(OrderId){
  var car;
  return getFirstAvailableCar()
  .then(data=>{
    console.log(data.availableTime);
    data.availableTime = checkIfTheAvailableDateIsUpToDate(data.availableTime);
    car = data;
    console.log(car);
    return car;
  })
  .then(()=>{
   return getOrderTime(OrderId);
  })
  .then(data=>{
    var orderTime = new Date(+car.availableTime+Number(data)*1000);
   return Promise.all([Order.findOneAndUpdate({'_id':OrderId}, { $set:{ arrivalDate: orderTime}},{new:true}),
   Cars.findOneAndUpdate({'_id':car._id}, { $set:{ availableTime: orderTime}},{new:true})]);
  })
  .then((data)=>{
    console.log(data);
    return data;
  })
}



function setNewAvailableTime(){
  var cars=[];
  return Cars.find({'active':true})
  .then((data)=>{
    
    data.forEach(car=>{
      time = car.endTime;
      console.log(time);
      cars.push(Cars.findOneAndUpdate({'_id':car._id}, { $set:{ availableTime: time}},{new:true}));
    });
    
    return Promise.all(cars);
  })
}


 function calculateEstimateForAllOrders(){
  var orders;
  return Order.find({'status':'in the store'}).sort({date: 1})
  .then(data=>{
    orders=data;
    // for(var i=0;i<orders.length;i++)
    // console.log(orders[i].date);
  })
  .then(()=>{
    return setNewAvailableTime();
  })
  .then(async()=>{
    for(var i=0;i<orders.length;i++) {
    console.log('//////////////////////////////////////');
    console.log(orders[i]._id);
    await setEstimateForNewOrder(orders[i]._id);
    };
  })
}

function getCars(){
  return Cars.find();
}

getCars().then(data=>{
  console.log(data);
  res.send(data);
})

//calculateEstimateForAllOrders();

//calculateEstimateTimeForOrder("5aa93aee9a70201696ff859a");


// function calculateEstimatedTime(){
//   var orderResult;
//   return Order.find({'status':'in the store'}).sort({date: 1})
//     .then(orders=>{
//       orderResult=orders;
//     })
//     .then(()=>{
//       return Cars.find();
//     })
//     .then(carsResult=>{
//       var promiseArray=[];
//       var estimatedTime;
//       orderResult.forEach(order => {
//         //console.log(order._id,' ',order.date,' ',order.time.text);
//         carsResult.sort((a, b) => a.finish_time - b.finish_time);
//         estimatedTime=getEstimate(carsResult[0].finish_time,order.time.value);
//         carsResult[0].finish_time=estimatedTime;
//         promiseArray.push(Order.findOneAndUpdate({"_id":  order._id}, { $set:{ "arrivalDate":  estimatedTime}},{new:true}));
//       });
//       console.log('5');
//       return Promise.all(promiseArray);
//     })
//     .catch(function (error) {
//       console.log('an error occurred');
//     });
// }

// function getEstimate(finishTime,orderTime){
//   if(!finishTime)
//     estimatedTime = new Date(+Date.now()+Number(orderTime)*1000);
//   else
//     estimatedTime = new Date(+finishTime+Number(orderTime)*1000);
//   return estimatedTime;      
// }

// function getArrivalTime(orderId){
//   return Order.findOne({'_id':orderId})
//     .catch((err)=>{
//       console.log('sorry, the id order is wrong.try to rewrite it');
//     return false;
//   })
//     .then(orderResult=>{
//       if(orderResult==null){       
//         console.log('sorry, the order with such id does not exist.');
//         return 'sorry, the order with such id does not exist.';
//       }
//       if(orderResult.status=="delivered"){
//        console.log('the order ',orderResult._id, 'already delivered');
//        return 'the order already delivered';
//       }
//       if(orderResult.arrivalDate){
//         console.log("for odrer id: ", orderResult._id, "arrival date is ",orderResult._id);
//         return orderResult.arrivalDate;
//       }
//       if(orderResult && !orderResult.arrivalDate){
//         return calculateEstimatedTime()
//         .then((data)=>{
//           data.some(order => {
//             if(order._id==orderId){
//               console.log("for odrer id: ", order._id, "arrival date is ",order.arrivalDate);
//               return orderResult.arrivalDate;
//               }
//           })
//         });
//       }
//     })
// }

// // getArrivalTime("1");//order.find gives error
// // getArrivalTime("5aa8e5fc6fbbc20b8ac35577");//id doesn't exist
// // getArrivalTime("5aa697339c9fdd6ae1f0da26");//order delivered
// // getArrivalTime("5aa8deee6fbbc20b8ac25553");//return arrival time
// // getArrivalTime("5aa8e5fc6fbbc20b8ac25511");//calculate time and then return it

// function getArrivalTimeForAll(){
//   return calculateEstimatedTime()
//   .then((data)=>{
//     return Order.find();
//   })
//   .then(orders=>{
//     orders.forEach(order => {
//       getArrivalTime(order._id);
//     });
//   })
// }

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