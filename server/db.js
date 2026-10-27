const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");
const sampleProducts = require("./data/sampleProducts");
const bcrypt = require("bcryptjs");

const DATA_FILE = path.join(__dirname, "data", "store.json");

// In-memory fallback store
let memoryStore = {
  products: [],
  users: [],
  orders: []
};

// Load saved data if file exists
function loadLocalStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      memoryStore = {
        products: Array.isArray(parsed.products) ? parsed.products : [],
        users: Array.isArray(parsed.users) ? parsed.users : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : []
      };
    }
  } catch (err) {
    console.warn("Could not read local store file, initializing fresh store:", err.message);
    memoryStore = { products: [], users: [], orders: [] };
  }
}

function saveLocalStore() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save local store:", err.message);
  }
}

class Database {
  constructor() {
    this.isMongo = false;
    this.mongoClient = null;
    this.db = null;
    this.productsCol = null;
    this.usersCol = null;
    this.ordersCol = null;
  }

  async init() {
    loadLocalStore();

    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/electroelite";
    console.log(`Connecting to MongoDB at: ${uri}...`);

    try {
      this.mongoClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 1000,
        connectTimeoutMS: 1000
      });

      await this.mongoClient.connect();
      this.db = this.mongoClient.db();
      this.productsCol = this.db.collection("products");
      this.usersCol = this.db.collection("users");
      this.ordersCol = this.db.collection("orders");
      this.isMongo = true;
      console.log("Connected successfully to MongoDB.");
    } catch (err) {
      this.isMongo = false;
      console.log(`MongoDB connection not available (${err.message}). Using resilient local database fallback.`);
    }

    await this.seedInitialData();
  }

  async seedInitialData() {
    // 1. Seed Admin User
    const adminEmail = "admin@electroelite.com";
    const existingAdmin = await this.findUserByEmail(adminEmail);
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await this.createUser({
        name: "ElectroElite Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        createdAt: new Date().toISOString()
      });
      console.log(`Admin user created: ${adminEmail} / admin123`);
    }

    // 2. Seed Sample Products (avoid duplicates by checking product count or name)
    const productCount = await this.countProducts();
    if (productCount === 0) {
      // If local store has products, migrate them to Mongo; otherwise use sampleProducts
      const sourceProducts = memoryStore.products.length > 0 ? memoryStore.products : sampleProducts;
      console.log(`Seeding ${sourceProducts.length} realistic electronics products...`);
      for (const prod of sourceProducts) {
        await this.createProduct({
          ...prod,
          createdAt: prod.createdAt || new Date().toISOString()
        });
      }
      console.log("Product catalog seeded successfully.");
    }
  }

  // --- USER OPERATIONS ---
  async findUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    if (this.isMongo) {
      return await this.usersCol.findOne({ email: cleanEmail });
    }
    return memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  }

  async findUserById(id) {
    if (!id) return null;
    if (this.isMongo) {
      try {
        return await this.usersCol.findOne({ _id: new ObjectId(id) });
      } catch {
        return null;
      }
    }
    return memoryStore.users.find(u => u._id === id) || null;
  }

  async createUser(userData) {
    const cleanUser = {
      ...userData,
      email: userData.email.trim().toLowerCase()
    };

    if (this.isMongo) {
      const res = await this.usersCol.insertOne(cleanUser);
      return { ...cleanUser, _id: res.insertedId.toString() };
    }

    const _id = "usr_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
    const saved = { ...cleanUser, _id };
    memoryStore.users.push(saved);
    saveLocalStore();
    return saved;
  }

  // --- PRODUCT OPERATIONS ---
  async countProducts(filter = {}) {
    if (this.isMongo) {
      return await this.productsCol.countDocuments(filter);
    }
    return memoryStore.products.length;
  }

  async getProducts({ search, category, brand, minPrice, maxPrice, inStock, sort = "featured" }) {
    let list = [];

    if (this.isMongo) {
      const query = {};
      if (search) {
        const regex = new RegExp(search, "i");
        query.$or = [{ name: regex }, { brand: regex }, { category: regex }, { description: regex }];
      }
      if (category && category !== "All") query.category = category;
      if (brand && brand !== "All") query.brand = brand;
      if (inStock === "true" || inStock === true) query.quantity = { $gt: 0 };
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      let cursor = this.productsCol.find(query);

      if (sort === "price-low") cursor = cursor.sort({ price: 1 });
      else if (sort === "price-high") cursor = cursor.sort({ price: -1 });
      else if (sort === "rating") cursor = cursor.sort({ rating: -1 });
      else if (sort === "newest") cursor = cursor.sort({ _id: -1 });
      else cursor = cursor.sort({ featured: -1, _id: -1 });

      const docs = await cursor.toArray();
      list = docs.map(d => ({ ...d, _id: d._id.toString() }));
    } else {
      list = [...memoryStore.products];

      if (search) {
        const s = search.toLowerCase();
        list = list.filter(p =>
          p.name.toLowerCase().includes(s) ||
          p.brand.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s) ||
          (p.description && p.description.toLowerCase().includes(s))
        );
      }

      if (category && category !== "All") {
        list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }

      if (brand && brand !== "All") {
        list = list.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
      }

      if (inStock === "true" || inStock === true) {
        list = list.filter(p => p.quantity > 0);
      }

      if (minPrice) list = list.filter(p => p.price >= Number(minPrice));
      if (maxPrice) list = list.filter(p => p.price <= Number(maxPrice));

      if (sort === "price-low") list.sort((a, b) => a.price - b.price);
      else if (sort === "price-high") list.sort((a, b) => b.price - a.price);
      else if (sort === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      else if (sort === "newest") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list.map(p => ({
      ...p,
      status: p.quantity > 0 ? "in-stock" : "out-of-stock"
    }));
  }

  async getProductById(id) {
    if (!id) return null;
    let prod = null;

    if (this.isMongo) {
      try {
        const query = ObjectId.isValid(id) && id.length === 24 ? { _id: new ObjectId(id) } : { _id: id };
        const doc = await this.productsCol.findOne(query);
        if (doc) prod = { ...doc, _id: doc._id.toString() };
      } catch {
        return null;
      }
    } else {
      prod = memoryStore.products.find(p => p._id === id);
    }

    if (!prod) return null;
    return {
      ...prod,
      status: prod.quantity > 0 ? "in-stock" : "out-of-stock"
    };
  }

  async createProduct(productData) {
    const doc = {
      name: productData.name,
      brand: productData.brand || "ElectroElite",
      category: productData.category || "Accessories",
      price: Number(productData.price) || 0,
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : Math.round(Number(productData.price) * 1.15),
      quantity: Number.isInteger(Number(productData.quantity)) ? Number(productData.quantity) : 10,
      rating: Number(productData.rating) || 4.5,
      reviewsCount: Number(productData.reviewsCount) || 12,
      featured: Boolean(productData.featured),
      badge: productData.badge || "",
      image: productData.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      description: productData.description || "",
      specs: productData.specs || {},
      createdAt: productData.createdAt || new Date().toISOString()
    };

    if (this.isMongo) {
      const res = await this.productsCol.insertOne(doc);
      return { ...doc, _id: res.insertedId.toString() };
    }

    const _id = "prd_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
    const saved = { ...doc, _id };
    memoryStore.products.push(saved);
    saveLocalStore();
    return saved;
  }

  async updateProduct(id, updates) {
    if (this.isMongo) {
      const cleanUpdates = { ...updates };
      delete cleanUpdates._id;
      if (cleanUpdates.price) cleanUpdates.price = Number(cleanUpdates.price);
      if (cleanUpdates.quantity !== undefined) cleanUpdates.quantity = Number(cleanUpdates.quantity);

      try {
        const query = ObjectId.isValid(id) && id.length === 24 ? { _id: new ObjectId(id) } : { _id: id };
        const res = await this.productsCol.findOneAndUpdate(
          query,
          { $set: cleanUpdates },
          { returnDocument: "after" }
        );
        if (!res) return null;
        return { ...res, _id: res._id.toString() };
      } catch {
        return null;
      }
    }

    const idx = memoryStore.products.findIndex(p => p._id === id);
    if (idx === -1) return null;
    memoryStore.products[idx] = {
      ...memoryStore.products[idx],
      ...updates,
      _id: id
    };
    saveLocalStore();
    return memoryStore.products[idx];
  }

  async adjustStock(id, change) {
    const amt = Number(change);
    if (!Number.isInteger(amt) || amt === 0) throw new Error("Stock change must be a non-zero integer");

    const prod = await this.getProductById(id);
    if (!prod) throw new Error("Product not found");

    const newQty = prod.quantity + amt;
    if (newQty < 0) throw new Error("Cannot sell more units than currently in stock");

    return await this.updateProduct(id, { quantity: newQty });
  }

  async deleteProduct(id) {
    if (this.isMongo) {
      try {
        const query = ObjectId.isValid(id) && id.length === 24 ? { _id: new ObjectId(id) } : { _id: id };
        const res = await this.productsCol.deleteOne(query);
        return res.deletedCount > 0;
      } catch {
        return false;
      }
    }

    const initialLen = memoryStore.products.length;
    memoryStore.products = memoryStore.products.filter(p => p._id !== id);
    const deleted = memoryStore.products.length < initialLen;
    if (deleted) saveLocalStore();
    return deleted;
  }

  // --- ORDER OPERATIONS ---
  async createOrder(orderData) {
    const doc = {
      ...orderData,
      status: "Placed",
      createdAt: new Date().toISOString()
    };

    // Decrement stock for ordered items
    for (const item of orderData.items || []) {
      try {
        await this.adjustStock(item.productId, -Math.abs(item.quantity));
      } catch (err) {
        console.warn(`Stock decrement skipped for ${item.productId}: ${err.message}`);
      }
    }

    if (this.isMongo) {
      const res = await this.ordersCol.insertOne(doc);
      return { ...doc, _id: res.insertedId.toString() };
    }

    const _id = "ord_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
    const saved = { ...doc, _id };
    memoryStore.orders.unshift(saved);
    saveLocalStore();
    return saved;
  }

  async getUserOrders(userId) {
    if (this.isMongo) {
      const docs = await this.ordersCol.find({ userId }).sort({ createdAt: -1 }).toArray();
      return docs.map(d => ({ ...d, _id: d._id.toString() }));
    }
    return memoryStore.orders.filter(o => o.userId === userId);
  }

  async getAllOrders() {
    if (this.isMongo) {
      const docs = await this.ordersCol.find().sort({ createdAt: -1 }).toArray();
      return docs.map(d => ({ ...d, _id: d._id.toString() }));
    }
    return [...memoryStore.orders];
  }

  async updateOrderStatus(id, status) {
    if (this.isMongo) {
      try {
        const query = ObjectId.isValid(id) && id.length === 24 ? { _id: new ObjectId(id) } : { _id: id };
        const res = await this.ordersCol.findOneAndUpdate(
          query,
          { $set: { status, updatedAt: new Date().toISOString() } },
          { returnDocument: "after" }
        );
        return res ? { ...res, _id: res._id.toString() } : null;
      } catch {
        return null;
      }
    }

    const order = memoryStore.orders.find(o => o._id === id);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    saveLocalStore();
    return order;
  }

  // --- STATS ---
  async getStats() {
    const allProducts = await this.getProducts({});
    const totalProducts = allProducts.length;
    const outOfStock = allProducts.filter(p => p.quantity === 0).length;
    const lowStock = allProducts.filter(p => p.quantity > 0 && p.quantity <= 10).length;
    const totalUnits = allProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const totalValue = allProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);

    const orders = await this.getAllOrders();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      totalProducts,
      outOfStock,
      lowStock,
      totalUnits,
      totalInventoryValue: totalValue,
      totalOrders,
      totalRevenue
    };
  }
}

const db = new Database();
module.exports = db;
