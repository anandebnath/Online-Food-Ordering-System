const API_URL = "http://localhost:5000/api";

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(food) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === food.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...food, qty: 1 });
  }

  saveCart(cart);
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== id);
  saveCart(cart);
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
  } else {
    saveCart(cart);
  }
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function clearCart() {
  localStorage.removeItem("cart");
  updateCartBadge();
}

// Navbar cart badge
function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (badge) {
    const count = getCart().reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = count;
  }
}

// Logged in user helpers
function getLoggedInUser() {
  return JSON.parse(localStorage.getItem("user")) || null;
}

function logoutUser() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

function updateNavAuthLinks() {
  const authLink = document.getElementById("authLink");
  if (!authLink) return;

  const user = getLoggedInUser();
  if (user) {
    authLink.innerHTML = `<a href="#" onclick="logoutUser()">Logout (${user.name})</a>`;
  } else {
    authLink.innerHTML = `<a href="login.html">Login</a>`;
  }
}

// Run on every page load
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  updateNavAuthLinks();
});
