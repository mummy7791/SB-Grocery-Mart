const API = "https://quickbasket-backend-y5pc.onrender.com";

function addProduct() {
  const product = {
    name: document.getElementById("name").value,
    category: document.getElementById("category").value,
    price: Number(document.getElementById("price").value),
    image: document.getElementById("image").value
  };

  fetch(API + "/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product)
  })
  .then(res => res.json())
  .then(data => {
    alert("Product Added ✅");
    document.getElementById("name").value = "";
    document.getElementById("category").value = "";
    document.getElementById("price").value = "";
    document.getElementById("image").value = "";
    loadProducts();
  })
  .catch(err => {
    alert("Product add failed ❌");
    console.log(err);
  });
}

function loadProducts() {
  fetch(API + "/api/products")
    .then(res => res.json())
    .then(data => {
      let output = "<h2>Products</h2>";

      data.forEach(p => {
        output += `
          <div class="card">
            <img src="${p.image}" width="100">
            <h3>${p.name}</h3>
            <p>${p.category}</p>
            <p>₹${p.price}</p>
          </div>
        `;
      });

      document.getElementById("output").innerHTML = output;
    });
}

function loadOrders() {
  fetch(API + "/api/orders")
    .then(res => res.json())
    .then(data => {
      let output = "<h2>Orders</h2>";

      data.forEach(o => {
        output += `
          <div class="card">
            <h3>${o.customerName}</h3>

            <p><b>Phone:</b> ${o.phone || "-"}</p>
            <p><b>Address:</b> ${o.address || "-"}</p>

            <hr>

            <p><b>Subtotal:</b> ₹${o.subtotal || 0}</p>
            <p><b>GST:</b> ₹${o.gst || 0}</p>
            <p><b>Delivery:</b> ₹${o.delivery || 0}</p>
            <h3>Total: ₹${o.total}</h3>

            <p><b>Status:</b> ${o.status}</p>

            <button onclick="updateStatus('${o._id}','Preparing')">Preparing</button>
            <button onclick="updateStatus('${o._id}','Out for Delivery')">Out</button>
            <button onclick="updateStatus('${o._id}','Delivered')">Delivered</button>
          </div>
        `;
      });

      document.getElementById("output").innerHTML = output;
    });
}
function updateStatus(id, status) {
  fetch(API + "/api/orders/" + id + "/status", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  })
  .then(res => res.json())
  .then(() => {
    alert("Status Updated ✅");
    loadOrders();
  });
}

loadProducts();
