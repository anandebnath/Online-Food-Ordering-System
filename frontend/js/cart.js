function renderCartPage() {
  const container = document.getElementById("cartItems");
  const summary = document.getElementById("cartSummary");
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-msg">Your cart is empty. Go add some delicious food!</p>';
    if (summary) summary.style.display = "none";
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div>৳${item.price} each</div>
        </div>
      </div>
      <div class="qty-controls">
        <button onclick="handleQtyChange(${item.id}, -1)">-</button>
        <span>${item.qty}</span>
        <button onclick="handleQtyChange(${item.id}, 1)">+</button>
      </div>
      <div>৳${item.price * item.qty}</div>
      <button class="remove-btn" onclick="handleRemove(${item.id})">Remove</button>
    </div>`
    )
    .join("");

  if (summary) {
    summary.style.display = "block";
    document.getElementById("cartTotal").textContent = `৳${getCartTotal()}`;
  }
}

function handleQtyChange(id, delta) {
  changeQty(id, delta);
  renderCartPage();
}

function handleRemove(id) {
  removeFromCart(id);
  renderCartPage();
}

// Payment method toggle
function togglePaymentFields() {
  const method = document.querySelector('input[name="paymentMethod"]:checked').value;
  document.getElementById("cardFields").style.display = method === "Card" ? "block" : "none";
  document.getElementById("mobileFields").style.display = method === "Mobile Banking" ? "block" : "none";
}

function validatePayment(method) {
  const msgEl = document.getElementById("formMsg");

  if (method === "Card") {
    const number = document.getElementById("cardNumber").value.trim();
    const expiry = document.getElementById("cardExpiry").value.trim();
    const cvv = document.getElementById("cardCvv").value.trim();

    if (!number || !expiry || !cvv) {
      msgEl.className = "error-msg";
      msgEl.textContent = "Please fill in all card details.";
      return null;
    }
    return { cardNumber: "**** **** **** " + number.slice(-4), cardExpiry: expiry };
  }

  if (method === "Mobile Banking") {
    const number = document.getElementById("mobileNumber").value.trim();
    if (!number || number.length < 11) {
      msgEl.className = "error-msg";
      msgEl.textContent = "Please enter a valid bKash/Nagad number.";
      return null;
    }
    return { mobileNumber: number };
  }

  return {};
}

const checkoutForm = document.getElementById("checkoutForm");
if (checkoutForm) {
  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById("formMsg");
    msgEl.className = "";
    msgEl.textContent = "";
    const cart = getCart();

    if (cart.length === 0) {
      msgEl.className = "error-msg";
      msgEl.textContent = "Your cart is empty!";
      return;
    }

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const paymentDetails = validatePayment(paymentMethod);
    if (paymentDetails === null) return; // validation failed, message already shown

    const orderData = {
      customerName: document.getElementById("custName").value.trim(),
      email: document.getElementById("custEmail").value.trim(),
      phone: document.getElementById("custPhone").value.trim(),
      address: document.getElementById("custAddress").value.trim(),
      items: cart,
      totalPrice: getCartTotal(),
      paymentMethod,
      paymentDetails
    };

    // Card / Mobile Banking hole ekta chotto "processing" delay

    if (paymentMethod !== "Cash on Delivery") {
      msgEl.className = "success-msg";
      msgEl.textContent = "Processing payment...";
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();
      console.log("Order response from server:", data);

      if (res.ok) {
        // Order ID ta pore order-success page e dekhanor jonno save kora
        sessionStorage.setItem("lastOrder", JSON.stringify(data.order));
        clearCart();
        window.location.href = "order-success.html";
      } else {
        msgEl.className = "error-msg";
        msgEl.textContent = data.message;
      }
    } catch (err) {
      msgEl.className = "error-msg";
      msgEl.textContent = "Server error. Is the backend running?";
    }
  });
}

document.addEventListener("DOMContentLoaded", renderCartPage);