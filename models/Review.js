import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    customerName: {
      type: String,
      required: true
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },

    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      default: null
    },

    deliveryBoyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryBoy",
      default: null
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    review: {
      type: String,
      trim: true,
      default: ""
    },

    reviewType: {
      type: String,
      enum: ["shop", "delivery", "product", "app"],
      default: "shop"
    }
  },
  {
    timestamps: true
  }
);

/* Prevent model overwrite error */
export default mongoose.models.Review ||
  mongoose.model("Review", reviewSchema);


