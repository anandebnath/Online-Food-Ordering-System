let allFoods = [];

const FALLBACK_FOODS = [
  {
    id: 101,
    name: "Chicken Biriyani",
    category: "Rice",
    price: 220,
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Hyderabadi%20Chicken%20Biryani.jpg",
    description: "Spicy and flavorful chicken biriyani served with raita."
  },
  {
    id: 102,
    name: "Beef Burger",
    category: "Fast Food",
    price: 180,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    description: "Juicy beef patty with cheese, lettuce and special sauce."
  },
  {
    id: 103,
    name: "Margherita Pizza",
    category: "Pizza",
    price: 350,
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400",
    description: "Classic pizza with fresh mozzarella, tomato and basil."
  },
  {
    id: 104,
    name: "Cold Coffee",
    category: "Drinks",
    price: 90,
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400",
    description: "Chilled creamy cold coffee, perfect refresher."
  }
];

async function loadFoods() {
  try {
    const res = await fetch(`${API_URL}/foods`);
    if (!res.ok) throw new Error("Bad response from server");

    const data = await res.json();
    allFoods = data.length > 0 ? data : FALLBACK_FOODS;
  } catch (err) {
    console.error("Failed to load foods from backend, using fallback demo items:", err);
    allFoods = FALLBACK_FOODS;
  }

  renderFoods(allFoods);
  renderFilters(allFoods);
}

function renderFoods(foods) {
  const grid = document.getElementById("foodGrid");
  if (!grid) return;

  if (foods.length === 0) {
    grid.innerHTML = '<p class="empty-msg">No items found.</p>';
    return;
  }

  grid.innerHTML = foods
    .map(
      (food) => `
    <div class="food-card">
      <img src="${food.image}" alt="${food.name}" onerror="this.onerror=null;this.src='https://placehold.co/400x300?text=${encodeURIComponent(food.name)}';">
      <div class="food-card-body">
        <h3>${food.name}</h3>
        <p>${food.description}</p>
        <div class="food-card-footer">
          <span class="price">৳${food.price}</span>
          <button class="add-cart-btn" onclick="handleAddToCart(${food.id})">Add to Cart</button>
        </div>
      </div>
    </div>`
    )
    .join("");
}

function renderFilters(foods) {
  const filterBar = document.getElementById("filterBar");
  if (!filterBar) return;

  const categories = ["All", ...new Set(foods.map((f) => f.category))];

  filterBar.innerHTML = categories
    .map(
      (cat, i) =>
        `<button class="filter-btn ${i === 0 ? "active" : ""}" onclick="filterByCategory('${cat}', this)">${cat}</button>`
    )
    .join("");
}

function filterByCategory(category, btn) {
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  if (category === "All") {
    renderFoods(allFoods);
  } else {
    renderFoods(allFoods.filter((f) => f.category === category));
  }
}

function handleAddToCart(id) {
  const food = allFoods.find((f) => f.id === id);
  if (food) {
    addToCart(food);
    alert(`${food.name} added to cart!`);
  }
}

document.addEventListener("DOMContentLoaded", loadFoods);