import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true,
      trim: true
    },

    /* =========================
       HASHED OTP (SECURE)
    ========================= */
    otp: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["LOGIN", "REGISTER", "FORGOT_PASSWORD"],
      default: "LOGIN"
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // auto delete after expiry
    },

    attempts: {
      type: Number,
      default: 0
    },

    verified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

/* =========================
   CHECK OTP METHOD
========================= */
otpSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

/* =========================
   LIMIT ATTEMPTS
========================= */
otpSchema.methods.incrementAttempts = function () {
  this.attempts += 1;
  return this.save();
};

const Otp =
  mongoose.models.Otp || mongoose.model("Otp", otpSchema);

export default Otp;


