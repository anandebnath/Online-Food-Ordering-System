// Register
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("formMsg");

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      console.log("Register response from server:", data);

      if (res.ok) {
        msgEl.className = "success-msg";
        msgEl.textContent = "Registration successful! Redirecting to login...";
        setTimeout(() => (window.location.href = "login.html"), 1200);
      } else {
        msgEl.className = "error-msg";
        msgEl.textContent = data.message;
      }
    } catch (err) {
      console.error("Register request failed:", err);
      msgEl.className = "error-msg";
      msgEl.textContent = "Server error. Is the backend running?";
    }
  });
}

// Login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("formMsg");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (email === "admin@food.com" && password === "admin123") {
      localStorage.setItem(
        "user",
        JSON.stringify({ name: "Admin", email, role: "admin" })
      );
      window.location.href = "admin.html";
      return;
    }

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      console.log("Login response from server:", data);

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "index.html";
      } else {
        msgEl.className = "error-msg";
        msgEl.textContent = data.message;
      }
    } catch (err) {
      console.error("Login request failed:", err);
      msgEl.className = "error-msg";
      msgEl.textContent = "Server error. Is the backend running?";
    }
  });
}