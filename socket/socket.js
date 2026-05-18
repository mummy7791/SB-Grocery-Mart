import DeliveryBoy from "../models/DeliveryBoy.js";
import Order from "../models/Order.js";

const socketHandler = (io) => {

  io.on("connection", (socket) => {

    console.log("✅ User Connected:", socket.id);

    /* =========================
       CUSTOMER JOIN
    ========================= */

    socket.on("customerJoin", (customerId) => {

      socket.join(customerId);

      console.log(
        "👤 Customer Joined:",
        customerId
      );

    });

    /* =========================
       SHOP JOIN
    ========================= */

    socket.on("shopJoin", (shopId) => {

      socket.join(shopId);

      console.log(
        "🏪 Shop Joined:",
        shopId
      );

    });

    /* =========================
       DELIVERY JOIN
    ========================= */

    socket.on(
      "deliveryJoin",

      async (deliveryBoyId) => {

        socket.join(deliveryBoyId);

        console.log(
          "🚚 Delivery Joined:",
          deliveryBoyId
        );

        /* SAVE SOCKET */

        await DeliveryBoy.findByIdAndUpdate(

          deliveryBoyId,

          {
            socketId: socket.id,
            isOnline: true
          }

        );

      }

    );

    /* =========================
       ADMIN JOIN
    ========================= */

    socket.on("adminJoin", () => {

      socket.join("adminRoom");

      console.log("⚙️ Admin Connected");

    });

    /* =========================
       NEW ORDER
    ========================= */

    socket.on(
      "newOrder",

      async (data) => {

        console.log(
          "🛒 New Order:",
          data
        );

        /* SEND TO SHOP */

        if(data.shopId){

          io.to(data.shopId).emit(
            "receiveOrder",
            data
          );

        }

        /* SEND TO ADMIN */

        io.to("adminRoom").emit(
          "adminNewOrder",
          data
        );

        /* SEND TO DELIVERY */

        io.emit(
          "deliveryNewOrder",
          data
        );

      }

    );

    /* =========================
       SHOP ACCEPT ORDER
    ========================= */

    socket.on(

      "shopAcceptedOrder",

      async (data) => {

        console.log(
          "🏪 Shop Accepted:",
          data
        );

        /* CUSTOMER */

        io.to(data.customerId).emit(

          "orderAccepted",

          {
            message:
              "Shop Accepted Your Order ✅",

            order: data
          }

        );

        /* ADMIN */

        io.to("adminRoom").emit(
          "orderStatusUpdated",
          data
        );

        /* DELIVERY */

        io.emit(
          "deliveryNewOrder",
          data
        );

      }

    );

    /* =========================
       DELIVERY ACCEPT
    ========================= */

    socket.on(

      "deliveryAccepted",

      async (data) => {

        console.log(
          "🚚 Delivery Accepted:",
          data
        );

        /* UPDATE ORDER */

        await Order.findByIdAndUpdate(

          data.orderId,

          {

            deliveryBoyId:
              data.deliveryBoy._id,

            deliveryBoyName:
              data.deliveryBoy.name,

            deliveryBoyPhone:
              data.deliveryBoy.phone,

            status:
              "Delivery Assigned",

            liveStatus:
              "Delivery Boy Assigned"

          }

        );

        /* CUSTOMER */

        io.to(data.customerId).emit(

          "deliveryAssigned",

          data

        );

        /* ADMIN */

        io.to("adminRoom").emit(

          "orderStatusUpdated",

          data

        );

      }

    );

    /* =========================
       OUT FOR DELIVERY
    ========================= */

    socket.on(

      "outForDelivery",

      async (data) => {

        console.log(
          "📦 Out For Delivery:",
          data
        );

        await Order.findByIdAndUpdate(

          data.orderId,

          {

            status:
              "Out For Delivery",

            liveStatus:
              "Delivery Partner On The Way"

          }

        );

        io.to(data.customerId).emit(

          "orderOutForDelivery",

          data

        );

        io.to("adminRoom").emit(

          "orderStatusUpdated",

          data

        );

      }

    );

    /* =========================
       LIVE LOCATION UPDATE
    ========================= */

    socket.on(

      "liveLocationUpdate",

      async (data) => {

        try{

          console.log(
            "📍 Live Location:",
            data
          );

          /* UPDATE DELIVERY BOY */

          await DeliveryBoy.findByIdAndUpdate(

            data.deliveryBoyId,

            {

              location: {

                lat: data.latitude,
                lng: data.longitude

              }

            }

          );

          /* UPDATE ORDER */

          if(data.orderId){

            await Order.findByIdAndUpdate(

              data.orderId,

              {

                deliveryLocation: {

                  lat: data.latitude,
                  lng: data.longitude

                }

              }

            );

          }

          /* SEND TO CUSTOMER */

          io.to(data.customerId).emit(

            "trackDeliveryBoy",

            {

              latitude: data.latitude,
              longitude: data.longitude

            }

          );

        }catch(err){

          console.log(err);

        }

      }

    );

    /* =========================
       ORDER DELIVERED
    ========================= */

    socket.on(

      "orderDelivered",

      async (data) => {

        console.log(
          "✅ Order Delivered:",
          data
        );

        /* UPDATE ORDER */

        await Order.findByIdAndUpdate(

          data.orderId,

          {

            status: "Delivered",

            liveStatus:
              "Order Delivered Successfully"

          }

        );

        /* UPDATE DELIVERY */

        if(data.deliveryBoyId){

          await DeliveryBoy.findByIdAndUpdate(

            data.deliveryBoyId,

            {

              $inc: {

                earnings:
                  data.earnings || 0,

                totalDeliveries: 1

              },

              currentOrderId: null

            }

          );

        }

        /* CUSTOMER */

        io.to(data.customerId).emit(

          "deliveredSuccess",

          {

            message:
              "Order Delivered Successfully ✅"

          }

        );

        /* ADMIN */

        io.to("adminRoom").emit(

          "orderStatusUpdated",

          data

        );

      }

    );

    /* =========================
       CHAT MESSAGE
    ========================= */

    socket.on(

      "sendMessage",

      (data) => {

        io.to(data.roomId).emit(

          "receiveMessage",

          {

            sender: data.sender,
            text: data.text,
            time: new Date()

          }

        );

      }

    );

    /* =========================
       DISCONNECT
    ========================= */

    socket.on(

      "disconnect",

      async () => {

        console.log(
          "❌ User Disconnected:",
          socket.id
        );

        try{

          await DeliveryBoy.findOneAndUpdate(

            { socketId: socket.id },

            {

              isOnline: false,
              socketId: ""

            }

          );

        }catch(err){

          console.log(err);

        }

      }

    );

  });

};

export default socketHandler;


