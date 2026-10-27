import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Truck, CheckCircle2, Clock, ArrowLeft, ArrowRight } from 'lucide-react';

export const OrdersPage = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("/api/orders/my", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders || []);
        } else {
          setError(data.message || "Failed to load orders");
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (!user) {
    return (
      <div className="max-w" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <Package size={48} style={{ color: 'var(--orange-500)', margin: '0 auto 16px' }} />
        <h2>Sign In to View Orders</h2>
        <p style={{ color: 'var(--gray-500)', marginTop: '8px', marginBottom: '24px' }}>
          Please sign in with your email and password to view your order history and track shipments.
        </p>
        <Link to="/login" className="btn btn-primary btn-lg">
          Sign In Now
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-500)' }}>Retrieving your order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>My Orders & Track Shipment</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
            Track active orders, view invoices, and review past purchases
          </p>
        </div>
        <Link to="/" className="btn btn-outline btn-sm">
          <ArrowLeft size={14} /> Back to Store
        </Link>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--gray-200)',
          borderRadius: '16px',
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <Package size={48} style={{ color: 'var(--gray-400)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No orders placed yet</h3>
          <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>
            Looks like you haven't placed any electronics orders yet.
          </p>
          <Link to="/" className="btn btn-primary">
            Explore Electronics Catalog
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(order => {
            const statusColor =
              order.status === "Delivered" ? "var(--success)" :
              order.status === "Shipped" ? "var(--teal-500)" :
              order.status === "Processing" ? "#3B82F6" : "var(--orange-500)";

            return (
              <div key={order._id} style={{
                background: '#FFFFFF',
                border: '1px solid var(--gray-200)',
                borderRadius: '14px',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {/* Order Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: '14px', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ORDER ID</span>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '14px' }}>#{order._id}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Placed On</span>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Total</span>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--navy-900)' }}>₹{order.totalAmount.toLocaleString('en-IN')}</div>
                  </div>

                  <div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: `${statusColor}15`,
                      color: statusColor,
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: 700
                    }}>
                      <Clock size={14} />
                      <span>{order.status || "Placed"}</span>
                    </span>
                  </div>
                </div>

                {/* Items in this order */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '48px', height: '48px', objectFit: 'contain', background: '#F8FAFC', borderRadius: '8px', padding: '4px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal-600)' }}>{item.brand}</div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.name}</div>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                        Qty: {item.quantity}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--gray-100)', paddingTop: '12px', fontSize: '13px', color: 'var(--gray-500)' }}>
                  <div>
                    <b>Deliver to:</b> {order.shippingAddress?.fullName}, {order.shippingAddress?.address}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
                  </div>
                  <div>
                    <b>Payment:</b> {order.paymentMethod}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

