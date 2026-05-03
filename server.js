import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dns from "dns";
import dotenv from "dotenv";
import path from "path";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Static folders
app.use(express.static(__dirname));
app.use("/customer-app", express.static(path.join(__dirname, "..", "customer-app")));
app.use("/admin-panel", express.static(path.join(__dirname, "..", "admin-panel")));
app.use("/shop-app", express.static(path.join(__dirname, "..", "shop-app")));
app.use("/delivery-boy-app", express.static(path.join(__dirname, "..", "delivery-boy-app")));

const MONGO_URL =
  process.env.MONGO_URI ||
  "mongodb+srv://quickbasket:Quick123@cluster0.d4uhmxk.mongodb.net/quickbasket";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err));

const JWT_SECRET = process.env.JWT_SECRET || "sb_grocery_secret_2026";

// SCHEMAS
const customerSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    email: String,
    address: String,
  },
  { timestamps: true }
);

const otpSchema = new mongoose.Schema(
  {
    phone: String,
    otp: String,
    name: String,
    email: String,
    address: String,
    expiresAt: Number,
  },
  { timestamps: true }
);

const shopSchema = new mongoose.Schema(
  {
    name: String,
    owner: String,
    phone: String,
    password: String,
    address: String,
  },
  { timestamps: true }
);

const deliveryBoySchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    password: String,
    vehicleNo: String,
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    shopId: String,
    shopName: String,
    name: String,
    category: String,
    price: Number,
    image: String,
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    customerId: String,
    customerName: String,
    phone: String,
    address: String,

    shopId: String,
    shopName: String,

    deliveryBoyId: String,
    deliveryBoyName: String,

    items: Array,

    subtotal: Number,
    gst: Number,
    delivery: Number,
    total: Number,

    commissionPercent: { type: Number, default: 10 },
    commissionAmount: Number,
    shopAmount: Number,

    paymentStatus: { type: String, default: "Paid" },
    status: { type: String, default: "Placed" },
  },
  { timestamps: true }
);

// MODELS
const Customer = mongoose.model("Customer", customerSchema);
const Otp = mongoose.model("Otp", otpSchema);
const Shop = mongoose.model("Shop", shopSchema);
const DeliveryBoy = mongoose.model("DeliveryBoy", deliveryBoySchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

// HOME
app.get("/", (req, res) => {
  res.send("SB Grocery Mart Backend Running ✅");
});

// SEED DEFAULT SHOP + DELIVERY BOY
app.get("/api/seed", async (req, res) => {
  let shop = await Shop.findOne({ phone: "9999999999" });
  if (!shop) {
    shop = await Shop.create({
      name: "SB Main Store",
      owner: "Shop Owner",
      phone: "9999999999",
      password: "1234",
      address: "Hyderabad",
    });
  }

  let boy = await DeliveryBoy.findOne({ phone: "8888888888" });
  if (!boy) {
    boy = await DeliveryBoy.create({
      name: "Delivery Boy",
      phone: "8888888888",
      password: "1234",
      vehicleNo: "TS09AB1234",
    });
  }

  res.json({
    message: "Seed created",
    shopLogin: { phone: "9999999999", password: "1234" },
    deliveryLogin: { phone: "8888888888", password: "1234" },
  });
});

// CUSTOMER OTP SEND
app.post("/api/customer/send-otp", async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    if (!name || !phone || !email || !address) {
      return res.status(400).json({
        message: "Name, phone, email and address required",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ phone });

    await Otp.create({
      name,
      phone,
      email,
      address,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    res.json({
      message: "Demo OTP generated",
      demoOtp: otp,
    });
  } catch {
    res.status(500).json({ message: "OTP send failed" });
  }
});

// CUSTOMER OTP VERIFY
app.post("/api/customer/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const savedOtp = await Otp.findOne({ phone, otp });

    if (!savedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > savedOtp.expiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    let customer = await Customer.findOne({ phone });

    if (!customer) {
      customer = await Customer.create({
        name: savedOtp.name,
        phone: savedOtp.phone,
        email: savedOtp.email,
        address: savedOtp.address,
      });
    } else {
      customer.name = savedOtp.name;
      customer.email = savedOtp.email;
      customer.address = savedOtp.address;
      await customer.save();
    }

    await Otp.deleteMany({ phone });

    const token = jwt.sign(
      { id: customer._id, phone: customer.phone, role: "customer" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      customer: {
        id: customer._id,
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
      },
    });
  } catch {
    res.status(500).json({ message: "OTP verify failed" });
  }
});

// CUSTOMER PROFILE
app.get("/api/customer/profile/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch {
    res.status(500).json({ message: "Profile fetch failed" });
  }
});

// ADMIN CUSTOMERS
app.get("/api/customers", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch {
    res.status(500).json({ message: "Customers fetch failed" });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer deleted" });
  } catch {
    res.status(500).json({ message: "Customer delete failed" });
  }
});

// SHOP CREATE
app.post("/api/shops", async (req, res) => {
  try {
    const shop = await Shop.create({
      name: req.body.name,
      owner: req.body.owner,
      phone: req.body.phone,
      password: req.body.password,
      address: req.body.address,
    });

    res.json({ message: "Shop created", shop });
  } catch {
    res.status(500).json({ message: "Shop create failed" });
  }
});

// SHOP LOGIN
app.post("/api/shop/login", async (req, res) => {
  try {
    const shop = await Shop.findOne({
      phone: req.body.phone,
      password: req.body.password,
    });

    if (!shop) return res.status(401).json({ message: "Invalid shop login" });

    res.json({
      message: "Shop login success",
      shop,
    });
  } catch {
    res.status(500).json({ message: "Shop login failed" });
  }
});

// ALL SHOPS
app.get("/api/shops", async (req, res) => {
  try {
    const shops = await Shop.find().sort({ createdAt: -1 });
    res.json(shops);
  } catch {
    res.status(500).json({ message: "Shops fetch failed" });
  }
});

// DELIVERY BOY CREATE
app.post("/api/delivery-boys", async (req, res) => {
  try {
    const boy = await DeliveryBoy.create({
      name: req.body.name,
      phone: req.body.phone,
      password: req.body.password,
      vehicleNo: req.body.vehicleNo,
    });

    res.json({ message: "Delivery boy created", boy });
  } catch {
    res.status(500).json({ message: "Delivery boy create failed" });
  }
});

// DELIVERY BOY LOGIN
app.post("/api/delivery/login", async (req, res) => {
  try {
    const boy = await DeliveryBoy.findOne({
      phone: req.body.phone,
      password: req.body.password,
    });

    if (!boy) return res.status(401).json({ message: "Invalid delivery login" });

    res.json({
      message: "Delivery boy login success",
      deliveryBoy: boy,
    });
  } catch {
    res.status(500).json({ message: "Delivery login failed" });
  }
});

// PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: "Products fetch failed" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    let shopId = req.body.shopId || "";
    let shopName = req.body.shopName || "SB Main Store";

    if (!shopId) {
      const defaultShop = await Shop.findOne();
      if (defaultShop) {
        shopId = defaultShop._id.toString();
        shopName = defaultShop.name;
      }
    }

    const product = await Product.create({
      shopId,
      shopName,
      name: req.body.name,
      category: req.body.category,
      price: Number(req.body.price),
      image: req.body.image,
    });

    res.json({ message: "Product added", product });
  } catch {
    res.status(500).json({ message: "Product add failed" });
  }
});

// SHOP PRODUCTS
// SHOP PRODUCT UPDATE
app.put("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        category: req.body.category,
        price: Number(req.body.price),
        image: req.body.image,
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated", product });
  } catch {
    res.status(500).json({ message: "Product update failed" });
  }
});

// SHOP PRODUCT DELETE
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch {
    res.status(500).json({ message: "Product delete failed" });
  }
});

// ORDERS CREATE
app.post("/api/orders", async (req, res) => {
  try {
    const total = Number(req.body.total || 0);
    const commissionPercent = 10;
    const commissionAmount = Math.round(total * commissionPercent) / 100;
    const shopAmount = total - commissionAmount;

    let shopId = req.body.shopId || "";
    let shopName = req.body.shopName || "SB Main Store";

    if (!shopId) {
      const firstItem = req.body.items?.[0];
      if (firstItem?.shopId) {
        shopId = firstItem.shopId;
        shopName = firstItem.shopName || shopName;
      } else {
        const defaultShop = await Shop.findOne();
        if (defaultShop) {
          shopId = defaultShop._id.toString();
          shopName = defaultShop.name;
        }
      }
    }

    const order = await Order.create({
      customerId: req.body.customerId,
      customerName: req.body.customerName,
      phone: req.body.phone,
      address: req.body.address,

      shopId,
      shopName,

      items: req.body.items || [],

      subtotal: Number(req.body.subtotal || 0),
      gst: Number(req.body.gst || 0),
      delivery: Number(req.body.delivery || 0),
      total,

      commissionPercent,
      commissionAmount,
      shopAmount,

      paymentStatus: req.body.paymentStatus || "Paid",
      status: "Placed",
    });

    res.json({ message: "Order placed", order });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Order failed" });
  }
});

// ADMIN ALL ORDERS
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Orders fetch failed" });
  }
});

// CUSTOMER ORDERS
app.get("/api/my-orders/:customerId", async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.params.customerId }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// SHOP ORDERS
app.get("/api/shop/orders/:shopId", async (req, res) => {
  try {
    const orders = await Order.find({ shopId: req.params.shopId }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Shop orders fetch failed" });
  }
});

// SHOP ACCEPT ORDER
app.put("/api/shop/orders/:id/accept", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "Accepted by Shop" },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order accepted", order });
  } catch {
    res.status(500).json({ message: "Accept failed" });
  }
});

// SHOP REJECT ORDER
app.put("/api/shop/orders/:id/reject", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected by Shop" },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order rejected", order });
  } catch {
    res.status(500).json({ message: "Reject failed" });
  }
});

// DELIVERY BOY AVAILABLE ORDERS
app.get("/api/delivery/orders", async (req, res) => {
  try {
    const orders = await Order.find({
      status: "Accepted by Shop",
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Delivery orders fetch failed" });
  }
});

// DELIVERY PICKUP
app.put("/api/delivery/orders/:id/pickup", async (req, res) => {
  try {
    const boy = await DeliveryBoy.findById(req.body.deliveryBoyId);

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: "Out for Delivery",
        deliveryBoyId: req.body.deliveryBoyId,
        deliveryBoyName: boy?.name || "",
      },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order picked up", order });
  } catch {
    res.status(500).json({ message: "Pickup failed" });
  }
});

// DELIVERY DELIVERED
app.put("/api/delivery/orders/:id/delivered", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "Delivered" },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order delivered", order });
  } catch {
    res.status(500).json({ message: "Delivery update failed" });
  }
});

// OLD STATUS UPDATE SUPPORT
app.put("/api/orders/:id/status", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Status updated", order });
  } catch {
    res.status(500).json({ message: "Status update failed" });
  }
});

// ADMIN STATS
app.get("/api/admin/stats", async (req, res) => {
  try {
    const orders = await Order.find();

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
    const totalSales = orders.reduce((s, o) => s + Number(o.total || 0), 0);
    const totalCommission = orders.reduce(
      (s, o) => s + Number(o.commissionAmount || 0),
      0
    );
    const shopPayable = orders.reduce((s, o) => s + Number(o.shopAmount || 0), 0);

    const customers = await Customer.countDocuments();
    const shops = await Shop.countDocuments();
    const deliveryBoys = await DeliveryBoy.countDocuments();

    res.json({
      totalOrders,
      deliveredOrders,
      totalSales,
      totalCommission,
      shopPayable,
      customers,
      shops,
      deliveryBoys,
    });
  } catch {
    res.status(500).json({ message: "Stats failed" });
  }
});

// SIMPLE ADMIN LOGIN
const users = [
  { username: "admin", password: "1234", role: "admin" },
  { username: "user", password: "1234", role: "customer" },
];

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  res.json({ message: "Login success", role: user.role });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`QuickBasket backend running on http://localhost:${PORT}`);
});
