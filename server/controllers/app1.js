
var ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
const mongoURL = 'mongodb://Anna2:Aa12345@ds247078.mlab.com:47078/delivery';
var cron = require('node-cron');
var CronJob = require('cron').CronJob;
var mongoose = require("mongoose");
var mongooseSchema = require('./schema');
var Promise = require('promise');
var _ = require('lodash');
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBUjFynG_oDGBJ05AVwTq_etAIqAvEd-rM',
  Promise: Promise
});


module.exports = (app) => {
  MongoClient.connect(mongoURL, (err, db) => { 
    mongoose.connect(mongoURL);
    var Cars = mongoose.model("Cars", mongooseSchema.carScheme);
    var Order = mongoose.model("Order",mongooseSchema.orderScheme,"order");

    function getStartAndEndPointsOfOrder(orderId){
      var points=[];
      return Order.findById(orderId)
      .then(order=>{
        points.push(order.departure_point);
        points.push(order.arrival_point);
        return points;
      })
    }


    function calculatePossibleAvailableTime(car,orderStartPoint){
      return calculateTimeBetweenTwoPoints(car.possible_arrival_point,orderStartPoint)
          .then(time =>{
            car.availableTime = checkIfTheAvailableDateIsUpToDate(car.availableTime);
            car.availableTime = new Date(+car.availableTime + time*1000);
            return car;
          })
    }

    function findNearestCarToOrder(cars){
      var nearestCar={};
          var bestTime = new Date(+Date.now()+10*365*24*60*60*1000);
          cars.forEach(car => {
            if(car.availableTime<bestTime){
              bestTime = car.availableTime;
              nearestCar=car;
            }
          });
          return nearestCar;
    }

    function getNearestCarForOrder(orderId){
      var orderPoints;
      return getStartAndEndPointsOfOrder(orderId)
      .then(data=>{
        orderPoints = data;
        return getActiveCars();
      })
      .then(cars=>{
        let carsArr = findNearestCarForAll(cars, orderId, orderPoints);
        return Promise.all(carsArr)
        .then(cars=>{         
          return findNearestCarToOrder(cars);
       })
     })
    }

    function findNearestCarForAll(cars, orderId, orderPoints) {
      return cars.map(car => {
        car.orderId = orderId;
        return calculatePossibleAvailableTime(car, orderPoints[0]);
      });
    }

    function addNearestOrdersToQueue(orders){
      let carsWithOrdersDetails =[];
      let odrersIdInQueue=[];
      orders.map(order=>{
        carsWithOrdersDetails.push(getNearestCarForOrder(order._id));
      });
      return Promise.all(carsWithOrdersDetails)
      .then(cars=>{
        console.log("here")
        carsWithOrdersDetails = _.groupBy(cars, '_id');
        return getCarsId();
      })
      .then(carsId=>{
        for(let i = 0;i<carsId.length;i++){
          let carWithNearestOrder = findClosestOrder(carsWithOrdersDetails,carsId,i);
          //console.log("carWithNearestOrder",carWithNearestOrder)
          if(carWithNearestOrder){
            odrersIdInQueue.push(carWithNearestOrder.orderId);
            //console.log("odrersIdInQueue",odrersIdInQueue);
            return Order.findOne({"_id":carWithNearestOrder.orderId})
            .then(order=>{
              //console.log("order",order);
              return changeCarData(carWithNearestOrder, order);
            })
          }
        }
      })
      .then(()=>{
        console.log("odrersIdInQueue",odrersIdInQueue);
        return odrersIdInQueue;
      })
    }

    function changeCarData(carWithNearestOrder, order) {
      let promiseArray =[];
      let arrivalTime = new Date(+carWithNearestOrder.availableTime + Number(order.time.value) * 1000);
      promiseArray.push(Cars.findOneAndUpdate({ "_id":carWithNearestOrder._id }, {
          $set: { availableTime: arrivalTime, possible_arrival_point:order.arrival_point },
          $push: { nextOrders: carWithNearestOrder.orderId }
        }, { new: true })
      );
      console.log("id",order._id,"time",arrivalTime);
      promiseArray.push(Order.findByIdAndUpdate(order._id,{$set: {arrivalDate:arrivalTime}},{new:true}));
      return Promise.all(promiseArray);
    }

    function deleteAddedOrders(orders,ordersId){
      ordersId.forEach(orderId => {
        for(let i =0;i<orders.length;i++){
          if(orders[i]._id==orderId){
            orders.splice(i, 1)
            i--;
          }
        }
      });
      return orders;
    }

    function setEstimateForNewOrders(orders,ordersId){
      if(ordersId.length>0){
        orders = deleteAddedOrders(orders,ordersId);
      }
      if(orders.length>0){
       addNearestOrdersToQueue(orders)
        .then(ordersId=>{
          //console.log("orders",orders);
         // console.log("ordersId",ordersId)
         setEstimateForNewOrders(orders,ordersId);
        })
      }
    }

    function resetCarData(){
      let carsArray=[];
      return Cars.find()
      .then(cars=>{
        cars.forEach(car => {
          carsArray.push(Cars.findOneAndUpdate({"_id":car._id},{ $set: {possible_arrival_point:car.departure_point,nextOrders:[]} },{new:true}));
        });
        return Promise.all(carsArray);
      })
    }

    function recalculateAllOrdersQueue(){
      let orders;
      return resetCarData()
      .then((data)=>{
        //console.log(data)
        return getOrdersThatIsInTheStore();
      })
      .then(data=>{
        orders = data;
        setEstimateForNewOrders(orders,[]);
      })
    }

    recalculateAllOrdersQueue();

    function findClosestOrder(carsWithOrdersDetails,carsId,i){
      if(!carsWithOrdersDetails[carsId[i]]){
        return;
      }
      let bestCar = carsWithOrdersDetails[carsId[i]][0];
      carsWithOrdersDetails[carsId[i]].forEach(car => {
        if(car.availableTime<bestCar.availableTime){
          bestCar = car;
        }
      });
      return bestCar;     
    }

    function getCarsId(){
      return Cars.find({active:true})
      .then(cars=>{
        let carsId=[];
        cars.forEach(car => {
          carsId.push(car._id);
        });
        return Promise.all(carsId);
      })
    }

    function getOrdersThatIsInTheStore(){
      return Order.find({status:"in the store"});
    }
   
    function calculateTimeBetweenTwoPoints(start,end) {
      var time;
        return googleMapsClient.directions({
          origin:  start,
          destination: end,
          mode: 'driving'
        }).
        asPromise()
        .then(data=>{
          return data.json.routes[0].legs[0].duration.value;;
        })
        .catch(data=>{
          console.log("something went wrong")
        })
    }

    function addOrderToQueue(order,car){
      let promiseArray =[];
      let arrivalTime = new Date(+car.availableTime + Number(order.time.value) * 1000);
      promiseArray.push(Cars.findOneAndUpdate({ "_id": car._id }, {
          $set: { availableTime: arrivalTime, possible_arrival_point:order.arrival_point },
          $push: { nextOrders: String(order._id) }
        }, { new: true })
      );
      promiseArray.push(Order.findByIdAndUpdate(order._id,{$set: {arrivalDate:arrivalTime}},{new:true}));
      return Promise.all(promiseArray);
    }
    
    function getOrdersWithGivenId(ordersId){
      let orders=[];
      ordersId.forEach(orderId => {
        orders.push(Order.findById(orderId));
      });
      return Promise.all(orders);
    }
    

    function setEstimateForNewOrder(orderId){
      let order;
      return getOrder(orderId)
      .then(data=>{
        order=data;
        return getNearestCarForOrder(orderId)
      })
      .then(car=>{
        console.log(car);
        return addOrderToQueue(order,car);
      })
      .then(data=>{
        console.log("done");
      })
    }

    function getOrder(orderId){
      return Order.findOne({"_id":orderId});
    }

   // setEstimateForNewOrder("5aa69ae49c9fdd6ae1f0da2a");


    //ТРЕБА ЗАМІНИТИ POST на PUT!!!
    //add new car 
    app.post('/cars', (request, response)=>{
      console.log("here");
      var car = new Cars({});
      car.save(function(err){
        if(err)
         return console.log(err);
        console.log("Saved");
      });
      if (err) {
        return console.log(err);
      }
      response.send(car);
    });

    //delete car
    app.delete('/cars/:id', function(req, res) {

      carDelete(req.params.id)
      .then((data)=>{
       return getCars();
      })
      .then(data=>{
        res.send(data);
      })
    });
    //ТРЕ ЗАМІНИТИ НА ДВА UPDATE CAR І ПОВЕРНУТИ ЗНАЧЕННЯ
  //app.post('/cars');
    app.post('/update', function(req, res) {
        
      var availableDate = new Date(Date.now());
    console.log("available time:",req.body);
      Cars.findOneAndUpdate({"_id":req.body.car._id},{ $set: { active: !req.body.car.active,availableTime:availableDate} },{new:true})
      .then((data)=>{
        console.log("all cars",data);
        return calculateEstimateForAllOrders();
      })
      .then(()=>{
        return getCars();
      })
      .then(data=>{
        res.send(data);
      })
    });

    app.get('/data', function(req, res) {
      getCars()
      .then(data=>{
        res.send(data);
      })
    });

    function carDelete(carId){    
      return  Cars.remove({"_id":carId});
    }

    function getActiveCars(){
      return Cars.find({active:true});
    }

    function getCars(){
      return Cars.find();
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
    

    function sendCar(orderId,time){
      console.log(time);
      var finishTime = new Date(+Date.now()+Number(time)*1000);
      var car;
      Cars.findOneAndUpdate({$and:[{status: "available"},{active:true}]},{ $set: { orderId: orderId,status:"is busy",endTime: finishTime} },{new:true})
      .then(carResult =>{ 
       if(carResult==null)
        return;
       car=carResult;
       return Order.findOneAndUpdate({"_id":  orderId}, { "status": 'on the way'}, { multi: true });
      })
      .then(orderResult=>{
        console.log("1",finishTime);
        finishTime=new Date(+finishTime+2*60*60*1000);
        console.log("2",finishTime);
        var job = new CronJob(finishTime, function() {
          console.log('her');          
            Order.findOneAndUpdate({"_id":  orderResult._id}, { $set:{ "status": 'delivered'}},{new:true}).exec();
            Cars.findOneAndUpdate({"_id": car._id}, { $set:{ orderId: null,status:"available",endTime:null}},{new:true}).exec();          
        });
        job.start();
      });
    }
    
    // cron.schedule('* * * * *', function(){
    //   console.log('running a task every minute');
    //   return Cars.find({$and:[{status: "available"},{active:true}]})
    //   .then(carsResult=> {
    //     var carCount = carsResult.length;
    //     console.log("count car",carCount)
    //     if(carCount==0)
    //      return;
    //     else
    //      return Order.find({"status": 'in the store'}).sort({date: 1}).limit(carCount)
    //   })
    //   .then(orders=> {  
    //     console.log(orders);
    //       if(!orders)
    //         return;
    //       orders.forEach(order => {
    //         return sendCar(order._id,order.time.value);       
    //       });      
    //   });
    // });

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

    function getOrderStatus(orderId){
      Order.findOne({"_id":orderId})
      .then(order=>{
        return order.status;
      })
    }

    db.close();

  })
}

