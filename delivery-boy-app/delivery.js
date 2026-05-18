function loadOrders() {
  fetch("https://quickbasket-backend-y5pc.onrender.com/api/orders")
    .then(res => res.json())
    .then(data => {
      let output = "";

      if (data.length === 0) {
        output = "<h3>No Orders</h3>";
      }

      data.forEach(o => {
        output += `
          <div style="border:1px solid black;margin:10px;padding:10px;">
            <p><b>Name:</b> ${o.customerName}</p>
            <p><b>Total:</b> ₹${o.total}</p>
            <p><b>Status:</b> ${o.status}</p>

            <button onclick="updateStatus(${o.id}, 'Out for Delivery')">
              Out for Delivery
            </button>

            <button onclick="updateStatus(${o.id}, 'Delivered')">
              Delivered
            </button>
          </div>
        `;
      });

      document.getElementById("orders").innerHTML = output;
    });
}

function updateStatus(id, status) {
  fetch(`https://quickbasket-backend-y5pc.onrender.com/api/orders/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  })
  .then(res => res.json())
  .then(() => {
    alert("Status Updated ✅");
    loadOrders();
  });
}