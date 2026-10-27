require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5003;
const JWT_SECRET = process.env.JWT_SECRET || "ELECTROELITE_SUPER_SECURE_JWT_SECRET_2026";

// Middlewares
app.use(cors());
app.use(express.json());

// Token verification middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authorization token required" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

// Optional authentication (supports both logged-in users and guest shoppers)
function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

// Admin-only middleware
function requireAdmin(req, res, next) {
  authenticate(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ success: false, message: "Admin privileges required" });
    }
  });
}

// --- HEALTH ROUTE ---
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    database: db.isMongo ? "MongoDB" : "Local Database (Resilient Fallback)",
    timestamp: new Date().toISOString()
  });
});

// --- AUTHENTICATION ROUTES (EMAIL & PASSWORD ONLY) ---
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.createUser({
      name,
      email,
      password: hashedPassword,
      role: "customer",
      createdAt: new Date().toISOString()
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role || "customer" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "customer"
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/auth/me", authenticate, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "customer"
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- PRODUCT ROUTES ---
app.get("/api/products", async (req, res) => {
  try {
    const { search, category, brand, minPrice, maxPrice, inStock, sort } = req.query;
    const products = await db.getProducts({ search, category, brand, minPrice, maxPrice, inStock, sort });
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/products/categories", async (req, res) => {
  try {
    const all = await db.getProducts({});
    const categories = Array.from(new Set(all.map(p => p.category))).sort();
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/products/brands", async (req, res) => {
  try {
    const all = await db.getProducts({});
    const brands = Array.from(new Set(all.map(p => p.brand))).sort();
    res.json({ success: true, brands });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/products/featured", async (req, res) => {
  try {
    const all = await db.getProducts({});
    const featured = all.filter(p => p.featured);
    res.json({ success: true, count: featured.length, products: featured });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/products", requireAdmin, async (req, res) => {
  try {
    const { name, brand, category, price, quantity } = req.body;
    if (!name || !brand || !category || price === undefined) {
      return res.status(400).json({ success: false, message: "Name, brand, category, and price are required" });
    }

    const newProduct = await db.createProduct(req.body);
    res.status(201).json({ success: true, message: "Product created successfully", product: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product updated successfully", product: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch("/api/products/:id/stock", requireAdmin, async (req, res) => {
  try {
    const { change } = req.body;
    const updated = await db.adjustStock(req.params.id, change);
    res.json({ success: true, message: "Stock updated successfully", product: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await db.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- ORDER ROUTES ---
app.post("/api/orders", optionalAuthenticate, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;
    if (!items || !items.length || !shippingAddress || !totalAmount) {
      return res.status(400).json({ success: false, message: "Invalid order details" });
    }

    const userId = req.user ? req.user.id : "guest_" + Date.now();
    const customerName = req.user ? req.user.name : (shippingAddress.fullName || "Guest Customer");
    const customerEmail = req.user ? req.user.email : (req.body.customerEmail || "guest@electroelite.com");

    const order = await db.createOrder({
      userId,
      customerName,
      customerEmail,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || "Cash on Delivery",
      totalAmount,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    });

    res.status(201).json({ success: true, message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/orders/my", authenticate, async (req, res) => {
  try {
    const orders = await db.getUserOrders(req.user.id);
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/orders", requireAdmin, async (req, res) => {
  try {
    const orders = await db.getAllOrders();
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch("/api/orders/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await db.updateOrderStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order status updated", order: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- ADMIN STATS ---
app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Initialize database and start server
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(` ElectroElite API running on http://localhost:${PORT}`);
    console.log(` Mode: ${db.isMongo ? "MongoDB Connected" : "Local Storage Mode"}`);
    console.log(` Default Admin: admin@electroelite.com / admin123`);
    console.log(`=================================================`);
  });
}).catch(err => {
  console.error("Critical error during server initialization:", err);
});

