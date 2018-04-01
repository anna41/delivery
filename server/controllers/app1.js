
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


    function getCarWithCalculatedTimeOfDelivery(car,orderStartPoint){
      return calculateTimeBetweenTwoPoints(car.possible_arrival_point,orderStartPoint)
          .then(time =>{
            car.availableTime = checkIfTheAvailableDateIsUpToDate(car.availableTime);
            car.availableTime = new Date(+car.availableTime + time*1000);
            return car;
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
        .then(cars=>{        
          return chooseNearestCarToOrder(cars);
       })
     })
    }

    function getAllCarsWithCalculatedTimeOfDelivery(cars, orderId, orderPoints) {
      return cars.map(car => {
        car.orderId = orderId;
        return getCarWithCalculatedTimeOfDelivery(car, orderPoints[0]);
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
        return getActiveCarsId();
      })
      .then(carsId=>{
        for(let i = 0;i<carsId.length;i++){
          let carWithNearestOrder = findCarWithClosestOrder(carsWithOrdersDetails,carsId,i);
          if(carWithNearestOrder){
            odrersIdInQueue.push(carWithNearestOrder.orderId);
            return Order.findOne({"_id":carWithNearestOrder.orderId})
            .then(order=>{
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

    function changeCarData(carWithNearestOrder, order) {
      let promiseArray =[];
      let arrivalTime = new Date(+carWithNearestOrder.availableTime + Number(order.time.value) * 1000);
      promiseArray.push(Cars.findOneAndUpdate({ "_id":carWithNearestOrder._id }, {
          $set: { availableTime: arrivalTime, possible_arrival_point:order.arrival_point },
          $push: { nextOrders: carWithNearestOrder.orderId }
        }, { new: true })
      );
      //console.log("id",order._id,"time",arrivalTime);
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
         setEstimateForNewOrders(orders,ordersId);
        })
      }
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

    function recalculateAllOrdersQueue(){
      return resetCarData()
      .then(()=>{
        return getOrdersThatIsInTheStore();
      })
      .then(orders=>{
        setEstimateForNewOrders(orders,[]);
      })
    }

    function getActiveCarsId(){
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
      //console.log("start",start);
      //console.log("end",end);
      var time;
      return googleMapsClient.directions({
        origin:  start,
        destination: end,
        mode: 'driving'
      }).
      asPromise()
      .then(data=>{
        console.log("time in google",data.json.routes[0].legs[0].duration.value);
        return data.json.routes[0].legs[0].duration.value;
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

    //add new car 
    app.put('/car', (request, response)=>{
      console.log("here");
      var car = new Cars({});
      car.save((err)=>{
        if(err)
         return console.log(err);
        console.log("Saved");
      });
      response.send("Success");
    });

    app.delete('/car/:id', (req, res)=> {
      Cars.remove({"_id":req.params.id})
      .then(()=>{
        res.send("Success");
      })
    });

    //update after change value of checkBox
    app.put('/car/:id', (req, res)=> {   
      return Cars.findById(req.params.id)
      .then((car)=>{
        var availableDate = new Date(Date.now());
        if(car.endTime){
          availableDate = car.endTime;
        }
        return Cars.update({"_id":car._id}, { $set: { active: !car.active,availableTime:availableDate }},{new:true})
      })
      .then(()=>{
        return Promise.resolve(recalculateAllOrdersQueue());
      })
      .then(()=>{
        res.send("Success");
      })
    });

    app.get('/data', (req, res)=> {
      return getCars()
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
    
    function getTimeOnTheWay(orderId){
      return Order.findById(orderId)
      .then(order=>{
        return new Date(+Date.now()+Number(order.time.value)*1000);
      })
    }

    function sendCar(orderId,carId){
      let finishTime;     
      return Promise.all([getTimeOnTheWay(orderId),getStartAndEndPointsOfOrder(orderId)])
      .then(data=>{
        finishTime=data[0];
        point = data[1][1];
       return Cars.findOneAndUpdate({"_id":carId},{ $set: { orderId: orderId,status:"is busy",endTime: finishTime,departure_point:point} },{new:true});
      })
      .then(car =>{ 
        if(!car){
          return;
        }
        return carOnTheWay(finishTime, car, orderId);
      })
    }

    function carOnTheWay(finishTime, car,orderId) {
      return Order.findOneAndUpdate({"_id":  orderId}, { "status": 'on the way'})
      .then(order=>{       
        var job = new CronJob(finishTime,()=> {
         console.log('here');
          return Promise.all([
            Order.findOneAndUpdate({ "_id": order._id }, { $set: { status: 'delivered', arrivalDate: Date.now() } }, { new: true }),
            Cars.findOneAndUpdate({ "_id": car._id }, { 
              $set: { orderId: null, status: "available", endTime: null },
              $pop: { nextOrders: -1 }
            }, { new: true })
          ]);
        },null,false,'Europe/Kiev');
        console.log("1");
        job.start();
      })
    }

    function takeNewOrders(){
      return Order.find({arrivalDate:null});
    }
    
    // cron.schedule('* * * * *', ()=>{
    //   console.log('running a task every minute');
    //   return Cars.find({$and:[{status: "available"},{active:true}]})
    //   .then(cars=> { 
    //     let value = true;
    //     cars.forEach(car => {
    //       if(car.nextOrders.length>0){
    //         sendCar(car.nextOrders[0],car._id);
    //       }
    //       else{
    //         if(value){
    //           value = false;
    //           takeNewOrders()
    //           .then(orders=>{
    //             return setEstimateForNewOrders(orders,[]);
    //           })
    //         }
    //       }
    //     });      
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

    db.close();

  })
}


