function showAdminTab(tab) {
  document.getElementById("foodsTab").style.display = tab === "foods" ? "block" : "none";
  document.getElementById("ordersTab").style.display = tab === "orders" ? "block" : "none";

  document.querySelectorAll(".admin-tabs button").forEach((b) => b.classList.remove("active"));
  document.getElementById(`btn-${tab}`).classList.add("active");

  if (tab === "foods") loadAdminFoods();
  if (tab === "orders") loadAdminOrders();
}

// Foods management
async function loadAdminFoods() {
  const res = await fetch(`${API_URL}/foods`);
  const foods = await res.json();

  const tbody = document.getElementById("foodsTableBody");
  tbody.innerHTML = foods
    .map(
      (f) => `
    <tr>
      <td>${f.id}</td>
      <td><img src="${f.image}" style="width:50px;height:50px;object-fit:cover;border-radius:6px"></td>
      <td>${f.name}</td>
      <td>${f.category}</td>
      <td>৳${f.price}</td>
      <td><button class="delete-btn" onclick="deleteFood(${f.id})">Delete</button></td>
    </tr>`
    )
    .join("");
}

const addFoodForm = document.getElementById("addFoodForm");
if (addFoodForm) {
  addFoodForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newFood = {
      name: document.getElementById("foodName").value.trim(),
      category: document.getElementById("foodCategory").value.trim(),
      price: document.getElementById("foodPrice").value,
      image: document.getElementById("foodImage").value.trim(),
      description: document.getElementById("foodDesc").value.trim()
    };

    await fetch(`${API_URL}/foods`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFood)
    });

    addFoodForm.reset();
    loadAdminFoods();
  });
}

async function deleteFood(id) {
  if (!confirm("Delete this food item?")) return;
  await fetch(`${API_URL}/foods/${id}`, { method: "DELETE" });
  loadAdminFoods();
}

// Orders management
async function loadAdminOrders() {
  const res = await fetch(`${API_URL}/orders`);
  const orders = await res.json();

  const tbody = document.getElementById("ordersTableBody");

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">No orders yet.</td></tr>';
    return;
  }

  tbody.innerHTML = orders
    .map((o) => {
      const badgeClass =
        o.status === "Completed"
          ? "badge-completed"
          : o.status === "Cancelled"
          ? "badge-cancelled"
          : "badge-pending";

      const itemsList = o.items.map((i) => `${i.name} x${i.qty}`).join(", ");

      const paymentBadge = o.paymentStatus === "Paid" ? "badge-completed" : "badge-pending";

      return `
      <tr>
        <td>${o.id}</td>
        <td>${o.customerName}<br><small>${o.phone}</small></td>
        <td>${itemsList}</td>
        <td>৳${o.totalPrice}</td>
        <td>
          ${o.paymentMethod || "Cash on Delivery"}<br>
          <span class="badge ${paymentBadge}">${o.paymentStatus || "Unpaid"}</span>
        </td>
        <td><span class="badge ${badgeClass}">${o.status}</span></td>
        <td>
          <select onchange="updateOrderStatus(${o.id}, this.value)">
            <option ${o.status === "Pending" ? "selected" : ""}>Pending</option>
            <option ${o.status === "Completed" ? "selected" : ""}>Completed</option>
            <option ${o.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
        </td>
      </tr>`;
    })
    .join("");
}

async function updateOrderStatus(id, status) {
  await fetch(`${API_URL}/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  loadAdminOrders();
}

document.addEventListener("DOMContentLoaded", () => {
  const user = getLoggedInUser();
  if (!user || user.role !== "admin") {
    alert("Admin access only. Please login as admin.");
    window.location.href = "login.html";
    return;
  }
  showAdminTab("foods");
});