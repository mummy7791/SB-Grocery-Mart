import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true,
      minlength: 4
    },

    address: {
      type: String,
      default: ""
    },

    profileImage: {
      type: String,
      default: ""
    },

    wallet: {
      type: Number,
      default: 0
    },

    totalOrders: {
      type: Number,
      default: 0
    },

    ratings: [
      {
        value: {
          type: Number,
          min: 1,
          max: 5
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order"
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

/* =========================
   HASH PASSWORD
========================= */
customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

/* =========================
   PASSWORD CHECK METHOD
========================= */
customerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Customer =
  mongoose.models.Customer ||
  mongoose.model("Customer", customerSchema);

export default Customer;


