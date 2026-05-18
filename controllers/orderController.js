import Order from "../models/Order.js";
import DeliveryBoy from "../models/DeliveryBoy.js";

/* =========================
   CREATE ORDER
========================= */
export const createOrder = async (req, res) => {
  try {
    const io = req.app.get("io");

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
    res.status(500).json({ message: "Order creation failed ❌" });
  }
};

/* =========================
   GET ALL ORDERS
========================= */
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to load orders ❌" });
  }
};

/* =========================
   UPDATE ORDER STATUS
========================= */
export const updateOrderStatus = async (req, res) => {
  try {
    const io = req.app.get("io");

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        liveStatus: req.body.status
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    io.emit("orderUpdated", order);

    if (req.body.status === "Out For Delivery") {
      io.emit("outForDelivery", order);
    }

    if (req.body.status === "Delivered") {
      io.emit("orderDelivered", order);
    }

    res.json(order);

  } catch (err) {
    res.status(500).json({ message: "Update failed ❌" });
  }
};

/* =========================
   ASSIGN DELIVERY BOY
========================= */
export const assignDeliveryBoy = async (req, res) => {
  try {
    const io = req.app.get("io");

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    order.deliveryBoyId = req.body.deliveryBoyId;
    order.status = "Assigned";

    await order.save();

    io.emit("deliveryAssigned", order);

    res.json(order);

  } catch (err) {
    res.status(500).json({ message: "Assign failed ❌" });
  }
};

/* =========================
   DELETE ORDER
========================= */
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found ❌" });
    }

    res.json({ message: "Order deleted ✅" });

  } catch (err) {
    res.status(500).json({ message: "Delete failed ❌" });
  }
};


