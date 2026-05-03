let cart = [];

// Update cart count
function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (el) el.innerText = cart.length;
}

// Load products
function loadProducts() {
  fetch("https://quickbasket-backend-y5pc.onrender.com/api/products")
    .then(res => res.json())
    .then(data => {
      let output = "";

      data.forEach(p => {
        output += `
          <div class="card">
            <img src="${p.image}">
            <h3>${p.name}</h3>
            <p>₹${p.price}</p>
            <button onclick="addToCart('${p._id}','${p.name}',${p.price})">Add</button>
          </div>
        `;
      });

      document.getElementById("products").innerHTML = output;
    });
}

// Add to cart
function addToCart(id, name, price) {
  cart.push({ id, name, price });
  updateCartCount();
  alert(name + " added ✅");
}

// View cart
function viewCart() {
  let total = 0;
  let output = "<h2>🛒 Cart</h2>";

  if (cart.length === 0) {
    output += "<p>Cart empty</p>";
  }

  cart.forEach(item => {
    total += Number(item.price);
    output += `<p>${item.name} - ₹${item.price}</p>`;
  });

  output += `<h3>Total: ₹${total}</h3>`;

  output += `
    <button onclick="payNow()">💳 Pay Now</button>
    <button onclick="loadProducts()">Back</button>
  `;

  document.getElementById("products").innerHTML = output;
}

// 🔥 Razorpay Payment
function payNow() {
  if (cart.length === 0) {
    alert("Cart is empty ❌");
    return;
  }

  let total = cart.reduce((sum, item) => sum + Number(item.price), 0);

 function payNow() {
  if (cart.length === 0) {
    alert("Cart is empty ❌");
    return;
  }

  alert("Payment Successful ✅ (Demo Mode)");
  placeOrder();
}

    theme: {
      color: "#0a8f3c"
    },

    method: {
      upi: true,
      card: true,
      netbanking: false,
      wallet: false
    },

    config: {
      display: {
        blocks: {
          testcard: {
            name: "Pay using Card",
            instruments: [
              { method: "card" }
            ]
          },
          testupi: {
            name: "Pay using UPI",
            instruments: [
              { method: "upi" }
            ]
          }
        },
        sequence: ["block.testcard", "block.testupi"],
        preferences: {
          show_default_blocks: false
        }
      }
    }
  };

  var rzp1 = new Razorpay(options);
  rzp1.open();
}
// Save order after payment
function placeOrder() {
  fetch("https://quickbasket-backend-y5pc.onrender.com/api/orders", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      customerName: "User",
      phone: "9999999999",
      address: "Hyderabad",
      items: cart,
      total: cart.reduce((sum, i) => sum + Number(i.price), 0)
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

// Track orders
function trackOrders() {
  fetch("https://quickbasket-backend-y5pc.onrender.com/api/orders")
    .then(res => res.json())
    .then(data => {
      let output = "<h2>📦 Orders</h2>";

      data.forEach(o => {
        output += `
          <div class="card">
            <p>Total: ₹${o.total}</p>
            <p>Status: ${o.status}</p>
          </div>
        `;
      });

      document.getElementById("products").innerHTML = output;
    });
}

// Logout
function logout() {
  localStorage.removeItem("user");
  location.href = "login.html";
}

// Init
loadProducts();
updateCartCount();