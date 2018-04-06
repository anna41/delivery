var ObjectId = require('mongodb').ObjectID;
var mongoose = require("mongoose");
var mongooseSchema = require('./schema');
const mongoURL = 'mongodb://Anna2:Aa12345@ds247078.mlab.com:47078/delivery';
mongoose.connect(mongoURL);
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyAzCRHdVtYccctAdksMC-1WDV4pmBmc_yc',
  Promise: Promise
});
var _ = require('lodash');


Cars = mongoose.model("Cars", mongooseSchema.carScheme);
Order = mongoose.model("Order",mongooseSchema.orderScheme,"order");

var tenYearsForward = 10*365*24*60*60*1000;

    function calculateTimeBetweenTwoPoints(startPoint,endPoint) {
      // console.log("start",startPoint);
      // console.log("end",endPoint);
      var time;
      return googleMapsClient.directions({
        origin:  startPoint,
        destination: endPoint,
        mode: 'driving'
      }).
      asPromise()
      .then(data=>{
       // console.log("time in google",data.json.routes[0].legs[0].duration.value);
        return data.json.routes[0].legs[0].duration.value;
      })
      .catch(err=>{
        console.log("errrrror");
      })
    }

    function getCarWithCalculatedTimeOfDelivery(car,orderStartPoint){
      return calculateTimeBetweenTwoPoints(car.possibleArrivalPoint,orderStartPoint)
      .then(time =>{
        car.availableTime = new Date(+checkIfTheAvailableDateIsUpToDate(car.availableTime) + time*1000);
          return car;
        })
    }

    function checkIfTheAvailableDateIsUpToDate(carDate){
      carDate = new Date(carDate);
      var nowDate =new Date();
      if(carDate<nowDate)
        carDate = nowDate;
      return carDate;
    }

    function getAllCarsWithCalculatedTimeOfDelivery(cars, orderId, orderPoints) {
     //console.log('orderPoints')
      return cars.map(car => {
        car.orderId = orderId; 
        return getCarWithCalculatedTimeOfDelivery(car, orderPoints[0]);
      });
    }

    function getNearestCarForOrder(orderId){
      //console.log('in get',orderId)
      var orderPoints;
      return getStartAndEndPointsOfOrder(orderId)
      .then(data=>{
        //console.log('in data',data)
        orderPoints = data;
        return getActiveCars();
      })
      .then(cars=>{ 
        //console.log('in get oederPoints',cars)     
        return Promise.all(getAllCarsWithCalculatedTimeOfDelivery(cars, orderId, orderPoints))
        .then(chooseNearestCarToOrder);
       })
    }
 
    function chooseNearestCarToOrder(cars){
      var nearestCar={};
          var bestTime = new Date(+Date.now()+tenYearsForward);
          cars.map(car => {
            if(car.availableTime<bestTime){
              bestTime = car.availableTime;
              nearestCar=car;
            }
          });
          return nearestCar;
    }

    function getStartAndEndPointsOfOrder(orderId){
     // console.log("id0",orderId);
      var points=[];
      return Order.findById(orderId)
      .then(order=>{
        points.push(order.departurePoint);
        points.push(order.arrivalPoint);
        return points;
      })
    }

    function getActiveCars(){
      return Cars.find({active:true});
    }

    function addNearestOrdersToQueue(orders){
      let carsWithOrdersDetails =[];
      let odrersIdInQueue=[];
      orders.map(order=>{
        carsWithOrdersDetails.push(getNearestCarForOrder(order._id));
      });
      return Promise.all(carsWithOrdersDetails)
      .then(cars=>{
        carsWithOrdersDetails = _.groupBy(cars, '_id');
        return getActiveCarsId();
      })
      .then(carsId=>{
        let changesInDB =[];
        for(let i = 0;i<carsId.length;i++){
          let carWithNearestOrder = findCarWithClosestOrder(carsWithOrdersDetails,carsId,i);
          if(carWithNearestOrder){
            odrersIdInQueue.push(carWithNearestOrder.orderId);
            Order.findOne({"_id":carWithNearestOrder.orderId})
            .then(order=>{
              changesInDB.push(saveChangesInDB(order,carWithNearestOrder));
            })
          }
        }
        return Promise.all([odrersIdInQueue,changesInDB]);
      })
      .then((data)=>{
        console.log("odrersIdInQueue",data[0]);
        return data[0];
      })
    }

    function getActiveCarsId(){
      return Cars.find({active:true})
      .then(cars=>{
        let carsId = cars.map(car => car._id); 
        return Promise.all(carsId);
      })
    }

    function saveChangesInDB(order,car){
      let promiseArray =[];
      //console.log("order id should",order._id);
      let arrivalTime = new Date(+car.availableTime + Number(order.time.value) * 1000);
      promiseArray.push(Cars.findOneAndUpdate({ "_id": car._id }, {
          $set: { availableTime: arrivalTime, possibleArrivalPoint:order.arrivalPoint },
          $push: { nextOrders: String(order._id) }
        }, { new: true })
      );
      promiseArray.push(Order.findByIdAndUpdate(order._id,{$set: {arrivalDate:arrivalTime}},{new:true}));
      return Promise.all(promiseArray);
    }

    function findCarWithClosestOrder(carsWithOrdersDetails,carsId,i){
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

    function setEstimateForNewOrders(orders, ordersId = []){
      return new Promise(resolve=> {
        if(ordersId.length>0){
          return resolve(deleteAddedOrders(orders,ordersId));
        }
        return resolve(orders);
      })
      .then(orders=>{
        if(orders.length>0){
        return addNearestOrdersToQueue(orders)
        .then(ordersId=>{
          return setEstimateForNewOrders(orders,ordersId);
        })
      }
      })
    }

    function deleteAddedOrders(orders,orderIds){
      return orders.filter(order =>{
        return !_.find(orderIds,(orderId)=>orderId==order._id);
      }); 
    }

    function recalculateAllOrdersQueue(){
      return resetCarData()
      .then(getOrdersThatIsInTheStore)
      .then(setEstimateForNewOrders);
    }

    function resetCarData(){
      let carsArray=[];
      return Cars.find()
      .then(cars=>{
        cars.forEach(car => {
          let availableDate = car.endTime;
          if(!availableDate){
            availableDate = new Date(Date.now());
          }
          carsArray.push(Cars.findOneAndUpdate({"_id":car._id},
          { $set: {possibleArrivalPoint:car.departurePoint,nextOrders:[],availableTime:availableDate} },{new:true}));
        });
        return Promise.all(carsArray);
      })
    }

    function getOrdersThatIsInTheStore(){
      return Order.find({status:"in the store"});
    }
  
    module.exports={
      getStartAndEndPointsOfOrder,
      setEstimateForNewOrders,
      saveChangesInDB,
      recalculateAllOrdersQueue,
      getOrdersThatIsInTheStore,
      checkIfTheAvailableDateIsUpToDate,
      deleteAddedOrders
    }