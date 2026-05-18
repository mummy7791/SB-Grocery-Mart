import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({

  tripId: {
    type: String,
    unique: true
  },

  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },

  deliveryBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryBoy",
    required: true
  },

  deliveryBoyName: {
    type: String,
    default: ""
  },

  customerName: {
    type: String,
    default: ""
  },

  customerPhone: {
    type: String,
    default: ""
  },

  pickupAddress: {
    type: String,
    required: true
  },

  deliveryAddress: {
    type: String,
    required: true
  },

  distance: {
    type: Number,
    default: 0
  },

  earnings: {
    type: Number,
    default: 0
  },

  duration: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: [
      "Assigned",
      "Picked",
      "On The Way",
      "Delivered",
      "Cancelled"
    ],
    default: "Assigned"
  },

  pickupLocation: {
    lat: {
      type: Number,
      default: 0
    },

    lng: {
      type: Number,
      default: 0
    }
  },

  deliveryLocation: {
    lat: {
      type: Number,
      default: 0
    },

    lng: {
      type: Number,
      default: 0
    }
  },

  completedAt: {
    type: Date,
    default: null
  }

},{
  timestamps:true
});

/* AUTO TRIP ID */
tripSchema.pre("save", function(next){

  if(!this.tripId){

    this.tripId =
      "TRIP" +
      Math.floor(
        100000 + Math.random() * 900000
      );

  }

  next();

});

const Trip =
  mongoose.models.Trip ||
  mongoose.model("Trip", tripSchema);

export default Trip;


