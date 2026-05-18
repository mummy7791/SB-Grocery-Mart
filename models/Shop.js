import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(

  {

    shopName: {
      type: String,
      required: true
    },

    ownerName: {
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

    address: {
      type: String,
      default: ""
    },

    category: {
      type: String,
      default: "Grocery"
    },

    isActive: {
      type: Boolean,
      default: true
    },

    rating: {
      type: Number,
      default: 5
    },

    totalOrders: {
      type: Number,
      default: 0
    },

    earnings: {
      type: Number,
      default: 0
    }

  },

  {
    timestamps: true
  }

);

const Shop =
mongoose.models.Shop ||
mongoose.model("Shop", shopSchema);

export default Shop;