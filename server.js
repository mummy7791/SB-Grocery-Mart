import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import Razorpay from "razorpay";

/* ROUTES */
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";

/* MODELS */
import Order from "./models/Order.js";
import DeliveryBoy from "./models/DeliveryBoy.js";

dotenv.config();

const app = express();

const server = http.createServer(app);

/* SOCKET IO */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  },
  transports: ["websocket", "polling"]
});

app.set("io", io);

/* SOCKET CONNECTION */
io.on("connection", (socket) => {

  console.log("🟢 Socket Connected:", socket.id);

  socket.on("joinDeliveryBoy", (id) => {
    socket.join(id);
  });

  socket.on("joinShop", (shopId) => {
    socket.join(shopId);
  });

  socket.on("deliveryOnline", (data) => {
    console.log("🚴 Delivery Online:", data);
  });

  socket.on("deliveryLocation", (data) => {
    io.emit("liveLocation", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket Disconnected");
  });

});

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* DATABASE */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.log(err));

/* ROUTES */
app.use("/api/customer", customerRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/shops", shopRoutes);

/* PLACE ORDER */
app.post("/api/place-order", async (req, res) => {

  try {

    const order = await Order.create({
      ...req.body,
      status: "Placed",
      liveStatus: "Order Placed"
    });

    io.emit("orderPlaced", order);

    /* AUTO ASSIGN DELIVERY BOY */
    const boy = await DeliveryBoy.findOne({
      isOnline: true,
      currentOrderId: null
    });

    if (boy) {

      order.deliveryBoyId = boy._id;
      order.deliveryBoyName = boy.name;
      order.status = "Assigned";

      await order.save();

      boy.currentOrderId = order._id;
      await boy.save();

      io.emit("deliveryAssigned", order);
    }

    res.json({
      success: true,
      order
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Order Failed"
    });

  }

});

/* GET ORDERS */
app.get("/api/orders", async (req, res) => {

  try {

    const orders = await Order.find()
    .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {

    res.status(500).json({
      message: "Failed"
    });

  }

});

/* UPDATE ORDER STATUS */
app.put("/api/orders/status/:id", async (req, res) => {

  try {

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status
      },
      {
        new: true
      }
    );

    io.emit("orderUpdated", order);

    res.json(order);

  } catch (err) {

    res.status(500).json({
      message: "Update Failed"
    });

  }

});

/* PAYMENT */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post("/api/payment/create", async (req, res) => {

  try {

    const order = await razorpay.orders.create({
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: "rcpt_" + Date.now()
    });

    res.json(order);

  } catch (err) {

    res.status(500).json({
      message: "Payment Failed"
    });

  }

});

/* TEST */
app.get("/", (req, res) => {
  res.send("🚀 Backend Running");
});

/* START */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server Running On ${PORT}`);
});