var mongoose = require("mongoose");
var mongooseSchema = require('./schema');
const mongoURL = 'mongodb://Anna2:Aa12345@ds247078.mlab.com:47078/delivery';
mongoose.connect(mongoURL);
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBUjFynG_oDGBJ05AVwTq_etAIqAvEd-rM',
  Promise: Promise
});
var _ = require('lodash');


Cars = mongoose.model("Cars", mongooseSchema.carScheme);
Order = mongoose.model("Order",mongooseSchema.orderScheme,"order");

    function calculateTimeBetweenTwoPoints(start,end) {
      // console.log("start",start);
      // console.log("end",end);
      var time;
      return googleMapsClient.directions({
        origin:  start,
        destination: end,
        mode: 'driving'
      }).
      asPromise()
      .then(data=>{
        //console.log("time in google",data.json.routes[0].legs[0].duration.value);
        return data.json.routes[0].legs[0].duration.value;
      })
      .catch(data=>{
        console.log("something went wrong")
      })
    }

    function getCarWithCalculatedTimeOfDelivery(car,orderStartPoint){
      return calculateTimeBetweenTwoPoints(car.possible_arrival_point,orderStartPoint)
          .then(time =>{
            car.availableTime = checkIfTheAvailableDateIsUpToDate(car.availableTime);
            car.availableTime = new Date(+car.availableTime + time*1000);
            return car;
          })
    }

    function checkIfTheAvailableDateIsUpToDate(carDate){
      carDate = new Date(carDate);
      var nowDate =new Date(Date.now());
        if(carDate<nowDate)
         carDate = nowDate;
        return carDate;
    }

    function getAllCarsWithCalculatedTimeOfDelivery(cars, orderId, orderPoints) {
      return cars.map(car => {
        car.orderId = orderId;
        return getCarWithCalculatedTimeOfDelivery(car, orderPoints[0]);
      });
    }

    function getNearestCarForOrder(orderId){
      var orderPoints;
      return getStartAndEndPointsOfOrder(orderId)
      .then(data=>{
        orderPoints = data;
        return getActiveCars();
      })
      .then(cars=>{       
        let carsArr = getAllCarsWithCalculatedTimeOfDelivery(cars, orderId, orderPoints);
        return Promise.all(carsArr)
        .then(chooseNearestCarToOrder);
       })
    }

    function chooseNearestCarToOrder(cars){
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

    function getStartAndEndPointsOfOrder(orderId){
      var points=[];
      return Order.findById(orderId)
      .then(order=>{
        points.push(order.departure_point);
        points.push(order.arrival_point);
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
        console.log("here")
        carsWithOrdersDetails = _.groupBy(cars, '_id');
        return getActiveCarsId();
      })
      .then(carsId=>{
        for(let i = 0;i<carsId.length;i++){
          let carWithNearestOrder = findCarWithClosestOrder(carsWithOrdersDetails,carsId,i);
          if(carWithNearestOrder){
            odrersIdInQueue.push(carWithNearestOrder.orderId);
            return Order.findOne({"_id":carWithNearestOrder.orderId})
            .then(order=>{
              return addOrderToQueue(order,carWithNearestOrder);
            })
          }
        }
      })
      .then(()=>{
        console.log("odrersIdInQueue",odrersIdInQueue);
        return odrersIdInQueue;
      })
    }

    function getActiveCarsId(){
      return Cars.find({active:true})
      .then(cars=>{
        let carsId = cars.map(car => car._id);
        
        return Promise.all(carsId);
      })
    }

    function addOrderToQueue(order,car){
      let promiseArray =[];
      console.log("order id should",order._id);
      let arrivalTime = new Date(+car.availableTime + Number(order.time.value) * 1000);
      promiseArray.push(Cars.findOneAndUpdate({ "_id": car._id }, {
          $set: { availableTime: arrivalTime, possible_arrival_point:order.arrival_point },
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
      if(ordersId.length>0){
        orders = deleteAddedOrders(orders,ordersId);
      }
      if(orders.length>0){
       return addNearestOrdersToQueue(orders)
        .then(ordersId=>{
          return setEstimateForNewOrders(orders,ordersId);
        })
      }
    }

    function deleteAddedOrders(orders,orderIds){
      return orders.filter(order =>{
        return !_.find(orderIds,(orderId) =>orderId==order._id);
      }); 
    }

    function recalculateAllOrdersQueue(){
      return resetCarData()
      .then(() => getOrdersThatIsInTheStore())
      .then(orders=> setEstimateForNewOrders(orders));
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
          carsArray.push(Cars.findOneAndUpdate({"_id":car._id},{ $set: {possible_arrival_point:car.departure_point,nextOrders:[],availableTime:availableDate} },{new:true}));
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
      addOrderToQueue,
      recalculateAllOrdersQueue,
      getOrdersThatIsInTheStore,
      checkIfTheAvailableDateIsUpToDate,
      deleteAddedOrders
    }