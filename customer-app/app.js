const API = "http://localhost:5000";

let cart = [];
let allProducts = [];
let userAddress = "Hyderabad";

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (el) el.innerText = cart.reduce((s, i) => s + i.qty, 0);
}

function getUserLocation() {
  const loc = document.getElementById("locationText");

  if (!navigator.geolocation) {
    loc.innerText = "Location not supported";
    return;
  }

  loc.innerText = "Detecting...";

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude.toFixed(5);
      const lon = pos.coords.longitude.toFixed(5);

      userAddress = `Lat: ${lat}, Lon: ${lon}`;
      loc.innerText = userAddress;

      localStorage.setItem("deliveryLocation", userAddress);
    },
    () => {
      loc.innerText = "Location permission denied";
    },
    {
      enableHighAccuracy: true,
      timeout: 10000
    }
  );
}
function loadProducts() {
  fetch(API + "/api/products")
    .then(res => res.json())
    .then(data => {
      allProducts = data;
      displayProducts(data);
    })
    .catch(() => {
      document.getElementById("products").innerHTML =
        "<p>Products loading failed ❌</p>";
    });
}

data.forEach(p => {
  const image = p.image || "https://via.placeholder.com/150";

  output += `
    <div class="card">
      <img src="${image}">
      <h3>${p.name}</h3>
      <p>${p.category || "Grocery"}</p>

      <div class="price-row">
        <h3>₹${p.price}</h3>
        <button onclick="addToCart('${p._id}', '${p.name}', ${p.price}, '${image}')">
          ADD
        </button>
      </div>
    </div>
  `;
});
  document.getElementById("products").innerHTML = output;

function searchProducts() {
  const q = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.category || "").toLowerCase().includes(q)
  );

  displayProducts(filtered);
}

function filterCategory(cat) {
  const filtered = allProducts.filter(p =>
    (p.category || "").toLowerCase().includes(cat.toLowerCase())
  );

  displayProducts(filtered);
}

function addToCart(id, name, price, image) {
  const item = cart.find(i => i.id === id);

  if (item) {
    item.qty++;
  } else {
    cart.push({
      id,
      name,
      price: Number(price),
      image,
      qty: 1
    });
  }

  updateCartCount();
  alert(name + " added ✅");
}

function viewCart() {
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const gst = Math.round(subtotal * 0.05);
  const delivery = subtotal > 500 ? 0 : 20;
  const total = subtotal + gst + delivery;

  let output = `<div class="cart-box"><h2>🛒 My Cart</h2>`;

  if (cart.length === 0) {
    output += "<p>Cart empty</p>";
  }

  cart.forEach(i => {
    output += `
      <p>${i.name} - ₹${i.price} x ${i.qty}</p>
    `;
  });

  output += `
    <p>Subtotal: ₹${subtotal}</p>
    <p>GST (5%): ₹${gst}</p>
    <p>Delivery: ₹${delivery}</p>
    <h2>Total: ₹${total}</h2>

    <button onclick="payNow()">💳 Pay Now</button>
    <button onclick="loadProducts()">⬅ Back</button>
  </div>`;

  document.getElementById("products").innerHTML = output;
}

function payNow() {
  if (cart.length === 0) {
    alert("Cart is empty ❌");
    return;
  }

  alert("Payment Successful ✅ Demo");
  placeOrder();
}

function placeOrder() {
  const customer = JSON.parse(localStorage.getItem("customer"));

  let customerName = customer?.name || prompt("Enter your name");
  if (!customerName) return;

  let phone = customer?.phone || prompt("Enter your phone number");
  if (!phone) return;

  let address = customer?.address || prompt("Enter your delivery address");
  if (!address) return;

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const gst = Math.round(subtotal * 0.05);
  const delivery = subtotal > 500 ? 0 : 20;
  const total = subtotal + gst + delivery;

  fetch(API + "/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerId: customer?.id || customer?._id || "",
      customerName,
      phone,
      address,
      items: cart,
      subtotal,
      gst,
      delivery,
      total
    })
  })
    .then(res => res.json())
    .then(() => {
      alert("Order placed 🎉");
      cart = [];
      updateCartCount();
      loadProducts();
    })
    .catch(() => alert("Order failed ❌"));
}

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

function logout() {
  localStorage.removeItem("customer");
  localStorage.removeItem("customerToken");
  localStorage.removeItem("user");
  location.href = "login.html";
}

getUserLocation();
loadProducts();
updateCartCount();
