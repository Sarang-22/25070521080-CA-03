import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  DollarSign,
  ShoppingCart,
  CheckCircle,
  Clock,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, token, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState("products"); // "products" | "orders"
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Product Form State (for adding a new product)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({
    name: "",
    brand: "Apple",
    category: "Smartphones",
    price: "",
    originalPrice: "",
    quantity: 15,
    badge: "New Arrival",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
    description: "",
    specsDisplay: "",
    specsProcessor: "",
    specsWarranty: "1 Year Official Warranty"
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Load stats
      const statsRes = await fetch("/api/admin/stats", { headers });
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      // Load products
      const prodsRes = await fetch("/api/products");
      const prodsData = await prodsRes.json();
      if (prodsData.success) setProducts(prodsData.products || []);

      // Load orders
      const ordersRes = await fetch("/api/orders", { headers });
      const ordersData = await ordersRes.json();
      if (ordersData.success) setOrders(ordersData.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  if (!user || !isAdmin) {
    return (
      <div className="max-w" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <ShieldCheck size={48} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
        <h2>Access Restricted</h2>
        <p style={{ color: 'var(--gray-500)', marginTop: '8px', marginBottom: '24px' }}>
          This page is reserved for store administrators. Sign in as <b>admin@electroelite.com</b> to access the dashboard.
        </p>
        <Link to="/login" className="btn btn-primary">
          Sign In as Administrator
        </Link>
      </div>
    );
  }

  // Stock Adjustment (+10 or -1)
  const handleStockAdjust = async (productId, change) => {
    try {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ change })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update stock");

      setMessage(`Stock adjusted by ${change > 0 ? `+${change}` : change}`);
      setTimeout(() => setMessage(""), 2500);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete");

      setMessage(`Product "${name}" deleted.`);
      setTimeout(() => setMessage(""), 2500);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Add Product Submit
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newProd.name,
        brand: newProd.brand,
        category: newProd.category,
        price: Number(newProd.price),
        originalPrice: newProd.originalPrice ? Number(newProd.originalPrice) : Math.round(Number(newProd.price) * 1.15),
        quantity: Number(newProd.quantity),
        badge: newProd.badge,
        image: newProd.image,
        description: newProd.description,
        specs: {
          Display: newProd.specsDisplay || "Standard Specification",
          Processor: newProd.specsProcessor || "High-Efficiency Quad/Octa Core",
          Warranty: newProd.specsWarranty || "1 Year Manufacturer Warranty"
        }
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create product");

      setMessage(`Product "${newProd.name}" created!`);
      setShowAddModal(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Update Order Status
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update order status");

      setMessage(`Order #${orderId} marked as ${newStatus}`);
      setTimeout(() => setMessage(""), 2500);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--teal-600)', fontWeight: 700, fontSize: '13px' }}>
            <ShieldCheck size={16} />
            <span>Store Administrator Console</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>ElectroElite Management Dashboard</h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={loadData} className="btn btn-outline btn-sm">
            <RefreshCw size={14} /> Refresh Data
          </button>
          <button type="button" onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
            <Plus size={16} /> Add New Electronics
          </button>
        </div>
      </div>

      {message && (
        <div style={{ background: '#ECFDF5', color: '#047857', padding: '12px 18px', borderRadius: '8px', marginBottom: '18px', fontWeight: 600 }}>
          ✓ {message}
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '12px 18px', borderRadius: '8px', marginBottom: '18px' }}>
          {error}
        </div>
      )}

      {/* KPI METRICS GRID */}
      {stats && (
        <div className="admin-stats-grid">
          <div className="stat-card">
            <div className="stat-icon orange">
              <DollarSign size={24} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>Total Revenue</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy-900)' }}>
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon teal">
              <ShoppingCart size={24} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>Total Orders</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy-900)' }}>
                {stats.totalOrders}
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon navy">
              <Package size={24} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>Catalog Products</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy-900)' }}>
                {stats.totalProducts} ({stats.totalUnits} Units)
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon danger">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>Stock Warnings</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--danger)' }}>
                {stats.outOfStock} Out • {stats.lowStock} Low
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--gray-200)', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === "products" ? '3px solid var(--orange-500)' : '3px solid transparent',
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: 700,
            color: activeTab === "products" ? 'var(--navy-900)' : 'var(--gray-500)',
            cursor: 'pointer'
          }}
        >
          Product Catalog & Stock ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === "orders" ? '3px solid var(--orange-500)' : '3px solid transparent',
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: 700,
            color: activeTab === "orders" ? 'var(--navy-900)' : 'var(--gray-500)',
            cursor: 'pointer'
          }}
        >
          Customer Orders & Dispatch ({orders.length})
        </button>
      </div>

      {/* TAB 1: PRODUCT MANAGEMENT */}
      {activeTab === "products" && (
        <div style={{ background: '#FFFFFF', border: '1px solid var(--gray-200)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead style={{ background: '#F8FAFC', borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-600)', fontSize: '12px', textTransform: 'uppercase' }}>
                <tr>
                  <th style={{ padding: '14px 18px' }}>Product</th>
                  <th style={{ padding: '14px 18px' }}>Brand / Category</th>
                  <th style={{ padding: '14px 18px' }}>Price</th>
                  <th style={{ padding: '14px 18px' }}>Stock Units</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Stock Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={p.image} alt={p.name} style={{ width: '42px', height: '42px', objectFit: 'contain', background: '#F8FAFC', borderRadius: '6px' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>ID: {p._id}</div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--teal-600)' }}>{p.brand}</span>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{p.category}</div>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 800 }}>
                      ₹{p.price.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>{p.quantity}</span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`product-stock-tag ${p.quantity === 0 ? 'out-of-stock' : 'in-stock'}`}>
                        {p.quantity === 0 ? "Out of Stock" : p.quantity <= 10 ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          disabled={p.quantity <= 0}
                          onClick={() => handleStockAdjust(p._id, -1)}
                          title="Sell 1 unit"
                        >
                          Sell 1
                        </button>
                        <button
                          type="button"
                          className="btn btn-teal btn-sm"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          onClick={() => handleStockAdjust(p._id, 10)}
                          title="Restock +10 units"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          style={{ background: 'none', border: '1px solid var(--gray-200)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: 'var(--danger)' }}
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === "orders" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.length === 0 ? (
            <div style={{ background: '#FFFFFF', padding: '40px', textAlign: 'center', borderRadius: '16px', border: '1px solid var(--gray-200)' }}>
              <p style={{ color: 'var(--gray-500)' }}>No customer orders placed yet.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order._id} style={{ background: '#FFFFFF', border: '1px solid var(--gray-200)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--gray-100)', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Order ID:</span>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace', marginLeft: '6px' }}>#{order._id}</span>
                    <span style={{ marginLeft: '12px', fontSize: '13px', color: 'var(--gray-600)' }}>
                      • {new Date(order.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Change Status:</span>
                    <select
                      value={order.status || "Placed"}
                      onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontWeight: 600, fontSize: '13px' }}
                    >
                      <option value="Placed">Placed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', fontSize: '14px' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '6px' }}>Customer & Shipping:</div>
                    <div>{order.shippingAddress?.fullName} ({order.customerEmail})</div>
                    <div style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
                      {order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>
                      Phone: {order.shippingAddress?.phone} | Method: {order.paymentMethod}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '6px' }}>Ordered Items:</div>
                    {order.items?.map((it, i) => (
                      <div key={i} style={{ fontSize: '13px', color: 'var(--gray-700)' }}>
                        {it.quantity}x {it.name}
                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Total Paid</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--navy-900)' }}>
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(7, 15, 30, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '28px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Add New Electronics Product</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--gray-500)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g. Sony Bravia 55-inch 4K OLED TV"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Brand *</label>
                  <select
                    className="form-input"
                    value={newProd.brand}
                    onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })}
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Sony">Sony</option>
                    <option value="LG">LG</option>
                    <option value="ASUS">ASUS</option>
                    <option value="Dell">Dell</option>
                    <option value="HP">HP</option>
                    <option value="Whirlpool">Whirlpool</option>
                    <option value="Daikin">Daikin</option>
                    <option value="OnePlus">OnePlus</option>
                    <option value="boAt">boAt</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-input"
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                  >
                    <option value="Smartphones">Smartphones</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Televisions">Televisions</option>
                    <option value="Refrigerators">Refrigerators</option>
                    <option value="Washing Machines">Washing Machines</option>
                    <option value="Air Conditioners">Air Conditioners</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="form-input"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    placeholder="e.g. 59990"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="form-input"
                    value={newProd.quantity}
                    onChange={(e) => setNewProd({ ...newProd, quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">High-Resolution Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={newProd.image}
                  onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Key Specifications (Display / Features)</label>
                <input
                  type="text"
                  className="form-input"
                  value={newProd.specsDisplay}
                  onChange={(e) => setNewProd({ ...newProd, specsDisplay: e.target.value })}
                  placeholder="e.g. 6.7-inch OLED 120Hz display"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  placeholder="Detailed electronics overview and features..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

