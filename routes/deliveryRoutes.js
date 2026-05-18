import express from "express";
import bcrypt from "bcryptjs";

import DeliveryBoy from "../models/DeliveryBoy.js";
import Order from "../models/Order.js";

const router = express.Router();

/* =========================
   REGISTER DELIVERY BOY
========================= */

router.post(
  "/register",
  async (req, res) => {

    try {

      const {

        name,
        phone,
        password,
        vehicleType,
        vehicleNumber

      } = req.body;

      const existing =
      await DeliveryBoy.findOne({
        phone
      });

      if(existing){

        return res.json({

          success:false,

          message:
          "Phone already exists ❌"

        });

      }

      const hashed =
      await bcrypt.hash(
        password,
        10
      );

      const boy =
      await DeliveryBoy.create({

        name,
        phone,

        password: hashed,

        vehicleType,
        vehicleNumber

      });

      res.json({

        success:true,

        message:
        "Delivery Boy Added ✅",

        deliveryBoy: boy

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success:false,

        message:
        "Register Failed ❌"

      });

    }

});

/* =========================
   LOGIN
========================= */

router.post(
  "/login",
  async (req, res) => {

    try {

      const {
        phone,
        password
      } = req.body;

      const boy =
      await DeliveryBoy.findOne({
        phone
      });

      if(!boy){

        return res.json({

          success:false,

          message:
          "Delivery Boy Not Found ❌"

        });

      }

      const match =
      await bcrypt.compare(
        password,
        boy.password
      );

      if(!match){

        return res.json({

          success:false,

          message:
          "Invalid Password ❌"

        });

      }

      res.json({

        success:true,

        message:
        "Login Success ✅",

        deliveryBoy: boy

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success:false,

        message:
        "Login Failed ❌"

      });

    }

});

/* =========================
   ONLINE / OFFLINE
========================= */

router.put(
  "/online/:id",
  async (req, res) => {

    try {

      const boy =
      await DeliveryBoy.findByIdAndUpdate(

        req.params.id,

        {
          isOnline:
          req.body.isOnline
        },

        {
          new:true
        }

      );

      res.json(boy);

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message:
        "Status Failed ❌"

      });

    }

});

/* =========================
   CURRENT ORDER
========================= */

router.get(
  "/current-order/:id",
  async (req, res) => {

    try {

      const boy =
      await DeliveryBoy.findById(
        req.params.id
      );

      if(
        !boy ||
        !boy.currentOrderId
      ){

        return res.json(null);

      }

      const order =
      await Order.findById(
        boy.currentOrderId
      );

      res.json(order);

    } catch (err) {

      console.log(err);

      res.status(500).json({

        message:
        "Fetch Failed ❌"

      });

    }

});

/* =========================
   COMPLETE DELIVERY
========================= */

router.put(
  "/complete/:orderId",
  async (req, res) => {

    try {

      const order =
      await Order.findById(
        req.params.orderId
      );

      if(!order){

        return res.json({

          success:false,

          message:
          "Order Not Found ❌"

        });

      }

      order.status =
      "Delivered";

      order.liveStatus =
      "Delivered Successfully";

      order.deliveredAt =
      new Date();

      await order.save();

      if(order.deliveryBoyId){

        const boy =
        await DeliveryBoy.findById(
          order.deliveryBoyId
        );

        if(boy){

          boy.currentOrderId =
          null;

          boy.totalDeliveries += 1;

          boy.earnings += 40;

          await boy.save();

        }

      }

      res.json({

        success:true,

        message:
        "Delivery Completed ✅"

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success:false,

        message:
        "Completion Failed ❌"

      });

    }

});

export default router;