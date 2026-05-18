io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  /* =========================
     JOIN USER ROOM
  ========================= */
  socket.on("joinRoom", (userId) => {
    if (!userId) return;

    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  /* =========================
     LIVE LOCATION (DELIVERY BOY)
  ========================= */
  socket.on("updateLocation", (data) => {
    /*
      data = {
        deliveryBoyId,
        lat,
        lng
      }
    */

    io.emit("liveLocation", data);
  });

  /* =========================
     ORDER STATUS UPDATE
  ========================= */
  socket.on("orderStatusUpdate", (data) => {
    /*
      data = {
        orderId,
        status,
        liveStatus,
        userId
      }
    */

    // send only to specific user room
    if (data.userId) {
      io.to(data.userId).emit("orderUpdated", data);
    }

    // also send to admin panel
    io.emit("adminOrderUpdated", data);
  });

  /* =========================
     DELIVERY ASSIGN EVENT
  ========================= */
  socket.on("deliveryAssigned", (data) => {
    /*
      data = {
        orderId,
        deliveryBoyId,
        userId
      }
    */

    if (data.userId) {
      io.to(data.userId).emit("orderAssigned", data);
    }

    io.to(data.deliveryBoyId).emit("newDeliveryJob", data);
  });

  /* =========================
     DISCONNECT
  ========================= */
  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});


