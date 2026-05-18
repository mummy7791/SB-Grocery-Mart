import mongoose from "mongoose";

const deliveryBoySchema =
new mongoose.Schema(

  {

    name: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    vehicleType: {
      type: String,
      default: "Bike"
    },

    vehicleNumber: {
      type: String,
      default: ""
    },

    isOnline: {
      type: Boolean,
      default: false
    },

    currentOrderId: {

      type:
      mongoose.Schema.Types.ObjectId,

      ref: "Order",

      default: null

    },

    totalDeliveries: {
      type: Number,
      default: 0
    },

    earnings: {
      type: Number,
      default: 0
    },

    rating: {
      type: Number,
      default: 5
    },

    liveLocation: {

      lat: Number,

      lng: Number

    }

  },

  {
    timestamps: true
  }

);

const DeliveryBoy =
mongoose.models.DeliveryBoy ||

mongoose.model(
  "DeliveryBoy",
  deliveryBoySchema
);

export default DeliveryBoy;