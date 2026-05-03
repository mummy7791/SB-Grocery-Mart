const API = "https://quickbasket-backend-y5pc.onrender.com";

if (localStorage.getItem("role") !== "admin") {
  alert("Access Denied ❌");
  window.location.href = "login.html";
}
if (!localStorage.getItem("user")) {
  window.location.href = "login.html";
}
// Add product
function addProduct() {
  const product = {
    name: document.getElementById("name").value,
    category: document.getElementById("category").value,
    price: document.getElementById("price").value,
    image: document.getElementById("image").value
  };

  fetch(API + "/api/products", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(product)
  })
  .then(res => res.json())
  .then(() => {
    document.getElementById("msg").innerText = "Product Added ✅";
  });
}

// Load products
function loadProducts() {
  fetch(API + "/api/products")
    .then(res => res.json())
    .then(data => {
      let output = "";

      data.forEach(p => {
        output += `
          <div class="card">
            <img src="${p.image}">
            <h3>${p.name}</h3>
            <p>₹${p.price}</p>
          </div>
        `;
      });

      document.getElementById("output").innerHTML = output;
    });
}

// Load orders
function loadOrders() {
  fetch(API + "/api/orders")
    .then(res => res.json())
    .then(data => {
      let output = "";

      data.forEach(o => {
        output += `
          <div class="card">
            <p><b>${o.customerName}</b></p>
            <p>₹${o.total}</p>
            <p>Status: ${o.status}</p>

            <button onclick="updateStatus('${o._id}','Preparing')">Preparing</button>
            <button onclick="updateStatus('${o._id}','Out for Delivery')">Out</button>
            <button onclick="updateStatus('${o._id}','Delivered')">Done</button>
          </div>
        `;
      });

      document.getElementById("output").innerHTML = output;
    });
}

// Update order status
function updateStatus(id, status) {
  fetch(API + "/api/orders/" + id + "/status", {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({status})
  })
  .then(res => res.json())
  .then(() => {
    alert("Updated ✅");
    loadOrders();
  });
}