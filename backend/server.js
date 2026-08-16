const express = require("express");
const cors = require("cors");
const path = require("path");
const { readData, writeData } = require("./db");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, "..", "frontend")));

// FOOD MENU ROUTES

app.get("/api/foods", (req, res) => {
  const foods = readData("foods.json");
  res.json(foods);
});

// New food item created by admin
app.post("/api/foods", (req, res) => {
  const { name, category, price, image, description } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Name and price required" });
  }

  const foods = readData("foods.json");
  const newFood = {
    id: foods.length > 0 ? foods[foods.length - 1].id + 1 : 1,
    name,
    category: category || "Others",
    price: Number(price),
    image: image || "https://via.placeholder.com/300",
    description: description || ""
  };

  foods.push(newFood);
  writeData("foods.json", foods);
  res.status(201).json({ message: "Food item added", food: newFood });
});

// Food item delete by admin panel
app.delete("/api/foods/:id", (req, res) => {
  const id = Number(req.params.id);
  let foods = readData("foods.json");
  const exists = foods.some((f) => f.id === id);

  if (!exists) {
    return res.status(404).json({ message: "Food not found" });
  }

  foods = foods.filter((f) => f.id !== id);
  writeData("foods.json", foods);
  res.json({ message: "Food item deleted" });
});

// 2. AUTH ROUTES (Register / Login)

app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const users = readData("users.json");
  const alreadyExists = users.find((u) => u.email === email);

  if (alreadyExists) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const newUser = {
    id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
    name,
    email,
    password,
    role: "user"
  };

  users.push(newUser);
  writeData("users.json", users);
  console.log(`✅ New user registered: ${email} (total users: ${users.length})`);
  res.status(201).json({ message: "Registration successful" });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const users = readData("users.json");

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    message: "Login successful",
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

// 3. ORDER ROUTES

app.post("/api/orders", (req, res) => {
  const {
    customerName,
    email,
    phone,
    address,
    items,
    totalPrice,
    paymentMethod,
    paymentDetails
  } = req.body;

  if (!customerName || !phone || !address || !items || items.length === 0) {
    return res.status(400).json({ message: "Missing order details" });
  }

  const orders = readData("orders.json");
  const newOrder = {
    id: orders.length > 0 ? orders[orders.length - 1].id + 1 : 1,
    customerName,
    email,
    phone,
    address,
    items,
    totalPrice,
    paymentMethod: paymentMethod || "Cash on Delivery",
    paymentDetails: paymentDetails || {},

    paymentStatus: paymentMethod && paymentMethod !== "Cash on Delivery" ? "Paid" : "Unpaid",
    status: "Pending",
    date: new Date().toLocaleString()
  };

  orders.push(newOrder);
  writeData("orders.json", orders);
  console.log(`✅ New order placed: #${newOrder.id} by ${customerName} (total orders: ${orders.length})`);
  res.status(201).json({ message: "Order placed successfully", order: newOrder });
});

// All orders (Admin panel)
app.get("/api/orders", (req, res) => {
  const orders = readData("orders.json");
  res.json(orders);
});

// Order status update (Admin panel)
app.put("/api/orders/:id", (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const orders = readData("orders.json");

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  writeData("orders.json", orders);
  res.json({ message: "Order status updated", order });
});

// Server Start

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
