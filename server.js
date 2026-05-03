import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dns from "dns";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Static files
// Static files
app.use(express.static(__dirname));

app.use(
  "/customer-app",
  express.static(path.join(__dirname, "..", "customer-app"))
);

app.use(
  "/admin-panel",
  express.static(path.join(__dirname, "..", "admin-panel"))
);

app.use(
  "/shop-app",
  express.static(path.join(__dirname, "..", "shop-app"))
);

app.use(
  "/delivery-boy-app",
  express.static(path.join(__dirname, "..", "delivery-boy-app"))
);
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
    total: Number,
    status: { type: String, default: "Placed" },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ message: "Product add failed" });
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
      total: Number(req.body.total),
      status: "Placed",
    });

    res.json({ message: "Order placed", order });
  } catch (err) {
    res.status(500).json({ message: "Order failed" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Orders fetch failed" });
  }
});

// CUSTOMER OWN ORDERS
app.get("/api/my-orders/:customerId", async (req, res) => {
  try {
    const orders = await Order.find({
      customerId: req.params.customerId,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ORDER STATUS UPDATE
app.put("/api/orders/:id/status", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Status update failed" });
  }
});

// SIMPLE ADMIN/CUSTOMER LOGIN
const users = [
  { username: "admin", password: "1234", role: "admin" },
  { username: "user", password: "1234", role: "customer" },
];

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login success", role: user.role });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`QuickBasket backend running on http://localhost:${PORT}`);
});
