import express from "express";
import bcrypt from "bcryptjs";

import Customer from "../models/Customer.js";
import Order from "../models/Order.js";
import Shop from "../models/Shop.js";
import DeliveryBoy from "../models/DeliveryBoy.js";

const router = express.Router();

/* =========================
   ADMIN LOGIN (STATIC)
========================= */

router.post("/login", async (req, res) => {

  try {

    const {
      username,
      password
    } = req.body;

    if (
      username === "admin" &&
      password === "admin123"
    ) {

      return res.json({

        success: true,
        message: "Admin Login Success ✅",
        token: "admin-token"

      });

    }

    res.status(401).json({

      success: false,
      message: "Invalid Admin Login ❌"

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,
      message: "Login Failed ❌"

    });

  }

});

/* =========================
   DASHBOARD STATS
========================= */

router.get("/dashboard", async (req, res) => {

  try {

    const customers =
      await Customer.countDocuments();

    const orders =
      await Order.countDocuments();

    const shops =
      await Shop.countDocuments();

    const deliveryBoys =
      await DeliveryBoy.countDocuments();

    const totalRevenue =
      await Order.aggregate([

        {
          $group: {
            _id: null,
            total: {
              $sum: "$total"
            }
          }
        }

      ]);

    res.json({

      customers,
      orders,
      shops,
      deliveryBoys,

      revenue:
        totalRevenue[0]?.total || 0

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      message: "Dashboard Error ❌"

    });

  }

});

/* =========================
   ALL ORDERS
========================= */

router.get("/orders", async (req, res) => {

  try {

    const orders =
      await Order.find()
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {

    res.status(500).json({

      message: "Failed ❌"

    });

  }

});

/* =========================
   ALL CUSTOMERS
========================= */

router.get("/customers", async (req, res) => {

  try {

    const customers =
      await Customer.find()
      .sort({ createdAt: -1 });

    res.json(customers);

  } catch (err) {

    res.status(500).json({

      message: "Failed ❌"

    });

  }

});

/* =========================
   ALL SHOPS
========================= */

router.get("/shops", async (req, res) => {

  try {

    const shops =
      await Shop.find()
      .sort({ createdAt: -1 });

    res.json(shops);

  } catch (err) {

    res.status(500).json({

      message: "Failed ❌"

    });

  }

});

/* =========================
   ALL DELIVERY BOYS
========================= */

router.get("/delivery-boys", async (req, res) => {

  try {

    const boys =
      await DeliveryBoy.find()
      .sort({ createdAt: -1 });

    res.json(boys);

  } catch (err) {

    res.status(500).json({

      message: "Failed ❌"

    });

  }

});

/* =========================
   UPDATE ORDER STATUS
========================= */

router.put("/order/:id", async (req, res) => {

  try {

    const order =
      await Order.findByIdAndUpdate(

        req.params.id,

        req.body,

        { new: true }

      );

    res.json({

      success: true,
      order

    });

  } catch (err) {

    res.status(500).json({

      message: "Update Failed ❌"

    });

  }

});

/* =========================
   DELETE CUSTOMER
========================= */

router.delete("/customer/:id", async (req, res) => {

  try {

    await Customer.findByIdAndDelete(
      req.params.id
    );

    res.json({

      success: true,
      message: "Customer Deleted ✅"

    });

  } catch (err) {

    res.status(500).json({

      message: "Delete Failed ❌"

    });

  }

});

export default router;