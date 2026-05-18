import express from "express";
import bcrypt from "bcryptjs";
import Shop from "../models/Shop.js";

const router = express.Router();

/* =========================
   REGISTER SHOP
========================= */

router.post("/register", async (req, res) => {

  try {

    const {

      shopName,
      ownerName,
      phone,
      password,
      address,
      category

    } = req.body;

    const exists =
      await Shop.findOne({ phone });

    if (exists) {

      return res.json({

        success: false,
        message: "Shop already exists ❌"

      });

    }

    const hashed =
      await bcrypt.hash(password, 10);

    const shop =
      await Shop.create({

        shopName,
        ownerName,
        phone,
        password: hashed,
        address,
        category

      });

    res.json({

      success: true,
      message: "Shop Created ✅",
      shop

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,
      message: "Shop Register Failed ❌"

    });

  }

});

/* =========================
   LOGIN SHOP
========================= */

router.post("/login", async (req, res) => {

  try {

    const { phone, password } = req.body;

    const shop = await Shop.findOne({ phone });

    if (!shop) {

      return res.json({

        success: false,
        message: "Shop not found ❌"

      });

    }

    const match =
      await bcrypt.compare(password, shop.password);

    if (!match) {

      return res.json({

        success: false,
        message: "Invalid password ❌"

      });

    }

    res.json({

      success: true,
      message: "Login Success ✅",
      shop

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
   GET ALL SHOPS
========================= */

router.get("/", async (req, res) => {

  try {

    const shops =
      await Shop.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.json(shops);

  } catch (err) {

    console.log(err);

    res.status(500).json({

      success: false,
      message: "Fetch Failed ❌"

    });

  }

});

export default router;