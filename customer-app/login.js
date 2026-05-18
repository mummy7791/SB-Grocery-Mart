function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("https://quickbasket-backend-y5pc.onrender.com/api/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {

    if (data.message === "Login success") {

      localStorage.setItem("user", username);
      localStorage.setItem("role", data.role);

      if (data.role === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "index.html";
      }

    } else {
      alert("Login Failed ❌");
    }

  });
}