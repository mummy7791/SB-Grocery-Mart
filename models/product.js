import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      trim: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    image: {
      type: String,
      required: true
    },

    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true
    },

    shopName: {
      type: String,
      required: true
    },

    stock: {
      type: Number,
      default: 100,
      min: 0
    },

    isAvailable: {
      type: Boolean,
      default: true
    },

    rating: {
      type: Number,
      default: 0
    },

    totalSold: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

/* FIX: Prevent model overwrite error in dev */
export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);


