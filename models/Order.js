import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(

  {

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer"
    },

    customerName: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    items: [

      {

        name: String,

        price: Number,

        qty: {
          type: Number,
          default: 1
        },

        image: String

      }

    ],

    subtotal: {
      type: Number,
      default: 0
    },

    gst: {
      type: Number,
      default: 0
    },

    delivery: {
      type: Number,
      default: 0
    },

    total: {
      type: Number,
      required: true
    },

    payment: {
      type: String,
      default: "COD"
    },

    status: {
      type: String,
      default: "Placed"
    },

    liveStatus: {
      type: String,
      default: "Order Placed"
    },

    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop"
    },

    shopName: {
      type: String,
      default: ""
    },

    deliveryBoyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryBoy"
    },

    deliveryBoyName: {
      type: String,
      default: ""
    },

    deliveryBoyPhone: {
      type: String,
      default: ""
    },

    lat: Number,

    lng: Number,

    deliveredAt: Date

  },

  {
    timestamps: true
  }

);

const Order =
mongoose.models.Order ||
mongoose.model(
  "Order",
  orderSchema
);

export default Order;