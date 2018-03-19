var mongoose = require("mongoose");
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
var orderScheme = new Schema({
    departure_point: {
        lat: Number,
        lng: Number,
        address: String
    },
    arrival_point: {
      lat: Number,
      lng: Number,
      address: String
    },
    time: {
    text: String,
    value: String
  },
    distance: Number,
    price: Number,
    date:Date,
    arrivalDate: { type: Date, default: null },
    email: String,
    status:{
      type: String,
      enum: ['in the store', 'on the way','delivered']},
    items: [
        {
            name: String,
            weight: Number
        }
    ]
  })
  
  var carScheme = new Schema({
    status:{
      type: String,
      enum: ['is busy', 'available']},
    capacity:{ type: Number, default: 1 },
    orderId:{ type: String, default: null },
    endTime:{ type: Date, default: null },
    availableTime:{type: Date, default: null},
    active:{type:Boolean, default: false}
  })

  module.exports={orderScheme,carScheme}