const mongoose = require('mongoose')

// Restaurant model

const restaurantSchema = mongoose.Schema({
  restaurantName: {type:String, required: true},
  cuisine:{type:String, required: true},
  address: {type:String, required: true},
  city: {type:String, required: true},
  rating: {
    type: Number,
    required: true,
    min:0,
    max:5,
    default:0
  },
  menu:[
    {
      itemName:String,
      price: Number,
      description: String,
      isVeg:  Boolean
    }
  ],
  averageRating: {
    type: Number,
    min:0,
    max:5,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    rating:Number,
    text: String
  }]
})

const Restaurant = mongoose.model('Restaurant', restaurantSchema)

module.exports = {Restaurant}