const API = "https://quickbasket-backend-y5pc.onrender.com";

let cart = [];
let allProducts = [];
let userAddress = "Hyderabad";

// 🔢 Cart Count
function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (el) el.innerText = cart.reduce((s, i) => s + i.qty, 0);
}

// 📍 Location
function getUserLocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    userAddress = `Lat: ${lat}, Lon: ${lon}`;
    document.getElementById("locationText").innerText = userAddress;
  }, () => {
    document.getElementById("locationText").innerText = "Location denied";
  });
}

// 🛒 Load Products
function loadProducts() {
  fetch(API + "/api/products")
    .then(res => res.json())
    .then(data => {
      allProducts = data;
      displayProducts(data);
    })
    .catch(() => {
      document.getElementById("products").innerHTML = "Products loading failed";
    });
}

// 📦 Display Products
function displayProducts(data) {
  let output = "";

  if (data.length === 0) output = "<p>No products found</p>";

  data.forEach(p => {
    output += `
      <div class="card">
        <img src="${p.image || "https://via.placeholder.com/150"}">
        <h3>${p.name}</h3>
        <p>${p.category || "Grocery"}</p>
        <h3>₹${p.price}</h3>
        <button onclick="addToCart('${p._id}','${p.name}',${p.price}, '${p.image || ""}')">ADD</button>
      </div>
    `;
  });

  document.getElementById("products").innerHTML = output;
}

// 🔍 Search
function searchProducts() {
  const q = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.category || "").toLowerCase().includes(q)
  );

  displayProducts(filtered);
}

// 📂 Category filter
function filterCategory(cat) {
  const filtered = allProducts.filter(p =>
    (p.category || "").toLowerCase().includes(cat.toLowerCase())
  );

  displayProducts(filtered);
}

// ➕ Add to cart
function addToCart(id, name, price, image) {
  const item = cart.find(i => i.id === id);

  if (item) item.qty++;
  else cart.push({ id, name, price: Number(price), image, qty: 1 });

  updateCartCount();
  alert(name + " added ✅");
}

// 🛒 View Cart
function viewCart() {
 let subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

let gst = Math.round(subtotal * 0.05);
let delivery = subtotal > 500 ? 0 : 20;

let total = subtotal + gst + delivery;
  let output = `<div class="cart-box"><h2>🛒 My Cart</h2>`;

  if (cart.length === 0) output += "<p>Cart empty</p>";

  cart.forEach(i => {
    output += `
      <p>${i.name} - ₹${i.price} x ${i.qty}</p>
    `;
  });

  output += `
    <h2>Total: ₹${total}</h2>
    <button onclick="payNow()">💳 Pay Now</button>
    <button onclick="loadProducts()">⬅ Back</button>
    </div>
  `;

  document.getElementById("products").innerHTML = output;
}

// 💳 Payment (Demo)
function payNow() {
  if (cart.length === 0) {
    alert("Cart is empty ❌");
    return;
  }

  alert("Payment Successful ✅ (Demo)");
  placeOrder();
}

// 📦 Place Order (with validation)
function placeOrder() {

  let customerName = prompt("Enter your name");
  if (!customerName) return alert("Name required ❌");

  let phone = prompt("Enter your phone number");
  if (!phone) return alert("Phone required ❌");

  let address = prompt("Enter your delivery address");
  if (!address) return alert("Address required ❌");

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  fetch(API + "/api/orders", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      customerName,
      phone,
      address,
      items: cart,
      total,
      status: "Placed"
    })
  })
  .then(res => res.json())
  .then(() => {
    alert("Order placed 🎉");
    cart = [];
    updateCartCount();
    loadProducts();
  });
}

// 📦 Track Orders (Auto refresh)
function trackOrders() {
  fetch(API + "/api/orders")
    .then(res => res.json())
    .then(data => {
      let output = "<div class='cart-box'><h2>📦 Orders</h2>";

      data.forEach(o => {
        output += `
          <hr>
          <p><b>Name:</b> ${o.customerName}</p>
          <p><b>Total:</b> ₹${o.total}</p>
          <p><b>Status:</b> ${o.status}</p>
          <p><b>Address:</b> ${o.address}</p>
        `;
      });

      output += "</div>";
      document.getElementById("products").innerHTML = output;
    });
}

// 🔁 Auto refresh orders every 5 sec
setInterval(() => {
  if (window.location.href.includes("orders")) {
    trackOrders();
  }
}, 5000);

// 🚪 Logout
function logout() {
  localStorage.removeItem("user");
  location.href = "login.html";
}

// 🚀 Init
getUserLocation();
loadProducts();
updateCartCount();
