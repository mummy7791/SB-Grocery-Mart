import express from "express";

import Order from "../models/Order.js";
import DeliveryBoy from "../models/DeliveryBoy.js";

const router = express.Router();

/* =========================
   PLACE ORDER
========================= */

router.post("/", async (req, res) => {

  try {

    const io = req.app.get("io");

    const {

      customerId,
      customerName,
      phone,
      address,
      items,
      subtotal,
      gst,
      delivery,
      total,
      payment,
      lat,
      lng

    } = req.body;

    if (
      !customerId ||
      !customerName ||
      !phone ||
      !address ||
      !items ||
      items.length === 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Missing order fields ❌"

      });

    }

    /* CREATE ORDER */

    const order =
      await Order.create({

        customerId,
        customerName,
        phone,
        address,
        items,
        subtotal,
        gst,
        delivery,
        total,
        payment,
        lat,
        lng,

        status: "Placed",

        liveStatus:
          "Order Placed"

      });

    /* SOCKET EVENT */

    io.emit(
      "orderPlaced",
      order
    );

    /* AUTO ASSIGN DELIVERY BOY */

    const boy =
      await DeliveryBoy.findOne({

        isOnline: true,

        currentOrderId: null

      });

    if (boy) {

      order.deliveryBoyId =
        boy._id;

      order.deliveryBoyName =
        boy.name;

      order.deliveryBoyPhone =
        boy.phone;

      order.status =
        "Assigned";

      order.liveStatus =
        "Delivery Boy Assigned";

      await order.save();

      boy.currentOrderId =
        order._id;

      await boy.save();

      io.emit(
        "deliveryAssigned",
        order
      );

    }

    res.json({

      success: true,

      message:
        "Order Placed ✅",

      order

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message:
        "Order Failed ❌"

    });

  }

});

/* =========================
   GET ALL ORDERS
========================= */

router.get("/", async (req, res) => {

  try {

    const orders =
      await Order.find()
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch orders ❌"

    });

  }

});

/* =========================
   GET SINGLE ORDER
========================= */

router.get("/:id", async (req, res) => {

  try {

    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {

      return res.status(404).json({

        success: false,

        message:
          "Order not found ❌"

      });

    }

    res.json(order);

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message:
        "Fetch Failed ❌"

    });

  }

});

/* =========================
   UPDATE STATUS
========================= */

router.put(
  "/status/:id",
  async (req, res) => {

    try {

      const io =
        req.app.get("io");

      const {
        status
      } = req.body;

      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {

        return res.status(404).json({

          success: false,

          message:
            "Order not found ❌"

        });

      }

      order.status = status;

      /* LIVE STATUS */

      if (
        status === "Accepted"
      ) {

        order.liveStatus =
          "Shop Accepted Order";

        io.emit(
          "shopAccepted",
          order
        );

      }

      if (
        status ===
        "Out For Delivery"
      ) {

        order.liveStatus =
          "Out For Delivery";

        io.emit(
          "outForDelivery",
          order
        );

      }

      if (
        status ===
        "Delivered"
      ) {

        order.liveStatus =
          "Delivered Successfully";

        order.deliveredAt =
          new Date();

        io.emit(
          "orderDelivered",
          order
        );

        /* FREE DELIVERY BOY */

        if (
          order.deliveryBoyId
        ) {

          await DeliveryBoy
          .findByIdAndUpdate(

            order.deliveryBoyId,

            {
              currentOrderId: null
            }

          );

        }

      }

      await order.save();

      io.emit(
        "orderUpdated",
        order
      );

      res.json({

        success: true,

        message:
          "Status Updated ✅",

        order

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false,

        message:
          "Update Failed ❌"

      });

    }

  }
);

/* =========================
   DELETE ORDER
========================= */

router.delete(
  "/:id",
  async (req, res) => {

    try {

      await Order.findByIdAndDelete(
        req.params.id
      );

      res.json({

        success: true,

        message:
          "Order Deleted ✅"

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false,

        message:
          "Delete Failed ❌"

      });

    }

  }
);

export default router;