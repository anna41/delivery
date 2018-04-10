const mongoURL = 'mongodb://Anna2:Aa12345@ds247078.mlab.com:47078/delivery';
var cron = require('node-cron');
var CronJob = require('cron').CronJob;
var mongoose = require("mongoose");
var mongooseSchema = require('./schema');
var Promise = require('promise');
var _ = require('lodash');
var ordersDelivery = require('../controllers/calculateOrdersDelivery');

module.exports = (app) => {
  mongoose.connect(mongoURL);
  var Cars = mongoose.model("Cars", mongooseSchema.carScheme);
  var Order = mongoose.model("Order", mongooseSchema.orderScheme, "order");

  //add new car 
  app.put('/car', (request, response) => {
    console.log("here");
    var car = new Cars({});
    response.send(car.save());
  });

  app.put('/newCar/:name', (request, response) => {
    console.log("here at add", request.params.name);
    var car = new Cars({ "carName": request.params.name });
    car.possibleArrivalPoint = car.departurePoint;
    response.send(car.save());
  });

  app.delete('/car/:id', (req, res) => {
    carDelete(req.params.id)
      .then((data) => {
        res.send(data);
      })
  });

  function carDelete(carId) {
    return Cars.remove({ "_id": carId });
  }

  //update after change value of checkBox
  app.put('/car/:id', (req, res) => {
    return Cars.findById(req.params.id)
      .then((car) => {
        var availableDate = new Date(Date.now());
        if (car.endTime) {
          availableDate = car.endTime;
        }
        return Cars.update({ "_id": car._id }, { $set: { active: !car.active, availableTime: availableDate } }, { new: true })
      })
      .then(ordersDelivery.recalculateAllOrdersQueue)
      .then((data) => {
        console.log("done",data);
        res.send("Success");
      })
  });

  app.get('/data', (req, res) => {
    return getCars()
      .then(data => {
        res.send(data);
      })
  });

  function getCars() {
    return Cars.find();
  }

  app.get('/orders/:status', (req, res) => {
    console.log("status", req.params.status);
    return getOrders(req.params.status)
      .then(data => {
        res.send(data);
      })
  })

  function getOrders(status) {
    if (status === 'all') {
      console.log("status in get", status);
      return Order.find();
    }
    return Order.find({ status: status });
  }

  app.get('/orderRoutes/:orderId', (req, res) => {
    console.log("orderId", req.params.orderId);
    return getAllCarDestinations(req.params.orderId)
      .then(data => {
        res.send(data);
      })
  })

  function getAllCarDestinations(carId) {
    let carDestinations = [];
    return Cars.findById(carId)
      .then(car => {
        carDestinations.push(car.departurePoint);
        const promises = car.nextOrders.map(orderId => {
          return ordersDelivery.getStartAndEndPointsOfOrder(orderId);
        });
        return Promise.all(promises)
          .then(result => {
            result.map((orderPoints) => {
              carDestinations.push(orderPoints[0]);
              carDestinations.push(orderPoints[1]);
            })
            return carDestinations;
          })
      })
  }

  getAllCarDestinations("5ac872d046907d2517048e36")
    .then(data => {
      console.log("all", data.length);
      console.log("all", data);
    })



  function sendCar(orderId, carId) {
    let finishTime;
    return Promise.all([
      getDeliveryTimeForOrder(orderId),
      ordersDelivery.getStartAndEndPointsOfOrder(orderId)
    ])
      .then(data => {
        finishTime = data[0];
        point = data[1][1];
        return Cars.findOneAndUpdate({ "_id": carId }, { $set: { orderId: orderId, status: "is busy", endTime: finishTime, departurePoint: point } }, { new: true });
      })
      .then(car => {
        if (!car) {
          return;
        }
        return carOnTheWay(finishTime, car, orderId);
      })
  }

  function getDeliveryTimeForOrder(orderId) {
    return Order.findById(orderId)
      .then(order => new Date(+Date.now() + Number(order.time.value) * 1000))
  }

  function carOnTheWay(finishTime, car, orderId) {
    return Order.findOneAndUpdate({ "_id": orderId }, { "status": 'on the way' })
      .then(order => {
        var job = imitationOfOrderOnTheWay(finishTime, order, car);
        console.log("1");
        job.start();
      })
  }

  function imitationOfOrderOnTheWay(finishTime, order, car) {
    return new CronJob(finishTime, () => {
      console.log('here');
      return Promise.all([
        Order.findOneAndUpdate({ "_id": order._id }, { $set: { status: 'delivered', arrivalDate: Date.now() } }, { new: true }),
        Cars.findOneAndUpdate({ "_id": car._id }, {
          $set: { orderId: null, status: "available", endTime: null },
          $pop: { nextOrders: -1 }
        }, { new: true })
      ]);
    }, null, false, 'Europe/Kiev');
  }

  function takeNewOrders() {
    return Order.find({ arrivalDate: null })
      .then(orders => {
        console.log("taking orders");
        return _.take(_.sortBy(orders, ['date']), 5);
      })
  }

  // cron.schedule('* * * * *', ()=>{
  //   console.log('running a task every minute');
  //   return Cars.find({$and:[{status: "available"},{active:true}]})
  //   .then(cars=> { 
  //     let value = true;
  //     cars.forEach(car => {
  //       if(car.nextOrders.length>0){
  //         return sendCar(car.nextOrders[0],car._id);
  //       }
  //       else{
  //         if(value){
  //           value = false;
  //           console.log("set estimete for new orders")
  //           return takeNewOrders()
  //           .then(orders=>{
  //             return ordersDelivery.setEstimateForNewOrders(orders);
  //           })
  //         }
  //       }
  //     });      
  //   });
  // });

  // takeNewOrders()
  // .then(orders=>{
  //   console.log("in the func");
  //   return ordersDelivery.setEstimateForNewOrders(orders);
  // })

  function getEstimateForOrder(orderId) {
    return Order.findOne({ "_id": orderId })
      .then(order => {
        return { "arrivalDate": order.arrivalDate, "id": order._id };
      })
  }

  function getAllOrdersId() {
    return Order.find()
      .then(orders => {
        return orders.map(order => order._id);
      })
  }

  function getEstimateForOrders(ordersId) {
    return new Promise(resolve => {
      if (!ordersId) {
        return getAllOrdersId()
          .then(resolve)
      }
      return resolve(ordersId);
    })
      .then(ordersId => {
        return Promise.all(ordersId.map(id => getEstimateForOrder(id)));
      })
  }
}

