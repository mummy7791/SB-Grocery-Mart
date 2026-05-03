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

// Static files
app.use(express.static(__dirname));

app.use("/customer-app", express.static(path.join(__dirname, "..", "customer-app")));
app.use("/admin-panel", express.static(path.join(__dirname, "..", "admin-panel")));
app.use("/shop-app", express.static(path.join(__dirname, "..", "shop-app")));
app.use("/delivery-boy-app", express.static(path.join(__dirname, "..", "delivery-boy-app")));

app.get("/customer-app/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "customer-app", "login.html"));
});

const MONGO_URL =
  process.env.MONGO_URI ||
  "mongodb+srv://quickbasket:Quick123@cluster0.d4uhmxk.mongodb.net/quickbasket";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err));

const productSchema = new mongoose.Schema(
  {
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
    items: Array,
    subtotal: Number,
    gst: Number,
    delivery: Number,
    total: Number,
    status: { type: String, default: "Placed" },
  },
  { timestamps: true }
);

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

const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);
const Customer = mongoose.model("Customer", customerSchema);
const Otp = mongoose.model("Otp", otpSchema);

const JWT_SECRET = process.env.JWT_SECRET || "sb_grocery_secret_2026";

app.get("/", (req, res) => {
  res.send("QuickBasket backend running ✅");
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
    const product = await Product.create({
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

// OTP SEND
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

// OTP VERIFY + CUSTOMER SAVE
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
      {
        id: customer._id,
        phone: customer.phone,
        role: "customer",
      },
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

// ORDERS
app.post("/api/orders", async (req, res) => {
  try {
    const order = await Order.create({
      customerId: req.body.customerId,
      customerName: req.body.customerName,
      phone: req.body.phone,
      address: req.body.address,
      items: req.body.items,
      subtotal: Number(req.body.subtotal || 0),
      gst: Number(req.body.gst || 0),
      delivery: Number(req.body.delivery || 0),
      total: Number(req.body.total),
      status: "Placed",
    });

    res.json({ message: "Order placed", order });
  } catch {
    res.status(500).json({ message: "Order failed" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Orders fetch failed" });
  }
});

app.get("/api/my-orders/:customerId", async (req, res) => {
  try {
    const orders = await Order.find({
      customerId: req.params.customerId,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

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
