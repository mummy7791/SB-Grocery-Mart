import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true
    },

    userType: {
      type: String,
      enum: ["customer", "shop", "delivery", "admin"],
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: [
        "ORDER_PLACED",
        "ORDER_ACCEPTED",
        "ORDER_ASSIGNED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "PAYMENT",
        "SYSTEM"
      ],
      default: "SYSTEM",
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true
    },

    /* =========================
       READ STATUS (IMPROVED)
    ========================= */
    read: {
      type: Boolean,
      default: false,
      index: true
    },

    readAt: {
      type: Date,
      default: null
    },

    /* =========================
       PRIORITY SYSTEM (NEW)
    ========================= */
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    /* =========================
       DELIVERY CHANNEL SUPPORT
    ========================= */
    channels: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true
  }
);

/* =========================
   MARK AS READ METHOD
========================= */
notificationSchema.methods.markRead = function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;


