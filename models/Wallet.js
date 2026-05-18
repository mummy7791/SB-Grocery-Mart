import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({

  walletId: {
    type: String,
    unique: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  userType: {
    type: String,
    enum: [
      "customer",
      "delivery",
      "shop",
      "admin"
    ],
    required: true
  },

  amount: {
    type: Number,
    required: true,
    default: 0
  },

  transactionType: {
    type: String,
    enum: [
      "CREDIT",
      "DEBIT"
    ],
    required: true
  },

  paymentMethod: {
    type: String,
    enum: [
      "COD",
      "UPI",
      "CARD",
      "WALLET",
      "RAZORPAY",
      "REFUND"
    ],
    default: "WALLET"
  },

  status: {
    type: String,
    enum: [
      "PENDING",
      "SUCCESS",
      "FAILED"
    ],
    default: "SUCCESS"
  },

  description: {
    type: String,
    default: ""
  },

  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null
  },

  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    default: null
  },

  balanceAfterTransaction: {
    type: Number,
    default: 0
  }

},{
  timestamps:true
});

/* AUTO WALLET ID */
walletSchema.pre("save", function(next){

  if(!this.walletId){

    this.walletId =
      "WALLET" +
      Math.floor(
        100000 + Math.random() * 900000
      );

  }

  next();

});

const Wallet =
  mongoose.models.Wallet ||
  mongoose.model("Wallet", walletSchema);

export default Wallet;


