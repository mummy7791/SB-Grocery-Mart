import express from "express";
import bcrypt from "bcryptjs";

import Customer from "../models/Customer.js";

const router = express.Router();

/* =========================
   REGISTER CUSTOMER
========================= */

router.post("/register", async (req, res) => {

  try {

    const {
      name,
      phone,
      email,
      address,
      password
    } = req.body;

    /* VALIDATION */

    if (!name || !phone || !password) {

      return res.status(400).json({

        success: false,

        message:
          "Name, Phone & Password required ❌"

      });

    }

    /* CHECK PHONE */

    const existingCustomer =
      await Customer.findOne({ phone });

    if (existingCustomer) {

      return res.status(400).json({

        success: false,

        message:
          "Phone already registered ❌"

      });

    }

    /* CREATE CUSTOMER */

    const customer =
      await Customer.create({

        name,
        phone,
        email,
        address,
        password

      });

    res.json({

      success: true,

      message:
        "Register Success ✅",

      customer

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message:
        "Register Failed ❌"

    });

  }

});

/* =========================
   LOGIN CUSTOMER
========================= */

router.post("/login", async (req, res) => {

  try {

    const {
      phone,
      password
    } = req.body;

    if (!phone || !password) {

      return res.status(400).json({

        success: false,

        message:
          "Phone & Password required ❌"

      });

    }

    /* FIND CUSTOMER */

    const customer =
      await Customer.findOne({ phone });

    if (!customer) {

      return res.status(404).json({

        success: false,

        message:
          "Customer not found ❌"

      });

    }

    /* CHECK BLOCKED */

    if (customer.isBlocked) {

      return res.status(403).json({

        success: false,

        message:
          "Account blocked by admin ❌"

      });

    }

    /* PASSWORD MATCH */

    const isMatch =
      await bcrypt.compare(
        password,
        customer.password
      );

    if (!isMatch) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid password ❌"

      });

    }

    /* UPDATE LAST LOGIN */

    customer.lastLogin =
      new Date();

    await customer.save();

    res.json({

      success: true,

      message:
        "Login Success ✅",

      customer

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message:
        "Login Failed ❌"

    });

  }

});

/* =========================
   FORGOT PASSWORD
========================= */

router.post(
  "/forgot-password",
  async (req, res) => {

    try {

      const {
        phone,
        newPassword
      } = req.body;

      if (!phone || !newPassword) {

        return res.status(400).json({

          success: false,

          message:
            "Phone & New Password required ❌"

        });

      }

      const customer =
        await Customer.findOne({ phone });

      if (!customer) {

        return res.status(404).json({

          success: false,

          message:
            "Phone not registered ❌"

        });

      }

      /* SAVE NEW PASSWORD */

      customer.password =
        newPassword;

      await customer.save();

      res.json({

        success: true,

        message:
          "Password Reset Success ✅"

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false,

        message:
          "Reset Failed ❌"

      });

    }

  }
);

/* =========================
   GET ALL CUSTOMERS
========================= */

router.get("/all", async (req, res) => {

  try {

    const customers =
      await Customer.find()
      .sort({ createdAt: -1 });

    res.json(customers);

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message:
        "Failed to fetch customers ❌"

    });

  }

});

/* =========================
   GET SINGLE CUSTOMER
========================= */

router.get("/:id", async (req, res) => {

  try {

    const customer =
      await Customer.findById(
        req.params.id
      );

    if (!customer) {

      return res.status(404).json({

        success: false,

        message:
          "Customer not found ❌"

      });

    }

    res.json(customer);

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message:
        "Fetch failed ❌"

    });

  }

});

/* =========================
   UPDATE CUSTOMER PROFILE
========================= */

router.put("/:id", async (req, res) => {

  try {

    const updatedCustomer =
      await Customer.findByIdAndUpdate(

        req.params.id,

        req.body,

        { new: true }

      );

    res.json({

      success: true,

      message:
        "Profile Updated ✅",

      customer:
        updatedCustomer

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message:
        "Update Failed ❌"

    });

  }

});

/* =========================
   DELETE CUSTOMER
========================= */

router.delete("/:id", async (req, res) => {

  try {

    await Customer.findByIdAndDelete(
      req.params.id
    );

    res.json({

      success: true,

      message:
        "Customer Deleted ✅"

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,

      message:
        "Delete Failed ❌"

    });

  }

});

export default router;