import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft, Truck, CreditCard, Banknote } from 'lucide-react';

export const CheckoutPage = () => {
  const { cartItems, total, subtotal, shipping, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user ? user.name : "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!cartItems.length) return;

    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.phone || !shippingAddress.pincode) {
      setError("Please fill out all required shipping address fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.product._id,
          name: item.product.name,
          brand: item.product.brand,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image
        })),
        shippingAddress,
        paymentMethod,
        totalAmount: total
      };

      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to place order");

      setOrderSuccess(data.order);
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#ECFDF5',
          color: 'var(--success)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <CheckCircle2 size={48} />
        </div>
        <span style={{ background: 'var(--teal-100)', color: 'var(--teal-600)', fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '999px', textTransform: 'uppercase' }}>
          Order Confirmed
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginTop: '12px', marginBottom: '8px' }}>
          Thank You For Your Order!
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '15px', maxWidth: '480px', margin: '0 auto 24px' }}>
          We have received your order for ₹{orderSuccess.totalAmount.toLocaleString('en-IN')}. Our warehouse team is preparing your package for express dispatch.
        </p>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--gray-200)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '500px',
          margin: '0 auto 32px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
            <span style={{ color: 'var(--gray-500)' }}>Order ID:</span>
            <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{orderSuccess._id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
            <span style={{ color: 'var(--gray-500)' }}>Delivery Address:</span>
            <span style={{ fontWeight: 600 }}>{orderSuccess.shippingAddress.address}, {orderSuccess.shippingAddress.city}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
            <span style={{ color: 'var(--gray-500)' }}>Payment Method:</span>
            <span style={{ fontWeight: 600 }}>{orderSuccess.paymentMethod}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderTop: '1px solid var(--gray-100)', paddingTop: '12px' }}>
            <span style={{ color: 'var(--gray-500)' }}>Estimated Delivery:</span>
            <span style={{ fontWeight: 700, color: 'var(--teal-600)' }}>Within 2-3 Business Days</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/orders" className="btn btn-navy btn-lg">
            View My Orders
          </Link>
          <Link to="/" className="btn btn-primary btn-lg">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>No items to checkout</h2>
        <p style={{ color: 'var(--gray-500)', marginTop: '8px', marginBottom: '20px' }}>Your cart is empty.</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>Checkout</h1>

      {!user && (
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#1E40AF', fontSize: '14px' }}>Already have an account?</div>
            <div style={{ fontSize: '13px', color: '#3B82F6' }}>Sign in with email and password to track orders and save your address.</div>
          </div>
          <Link to="/login" className="btn btn-navy btn-sm">
            Sign In
          </Link>
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="cart-layout">
        {/* Left: Shipping Address & Payment Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Shipping Address */}
          <div className="cart-card">
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={20} color="var(--orange-500)" />
              <span>1. Shipping Information</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  required
                  value={shippingAddress.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Sarang Mendhekar"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  required
                  value={shippingAddress.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address *</label>
              <textarea
                name="address"
                className="form-input"
                rows="2"
                required
                value={shippingAddress.address}
                onChange={handleChange}
                placeholder="House / Flat No., Apartment Name, Street, Landmark"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  required
                  value={shippingAddress.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                />
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <input
                  type="text"
                  name="state"
                  className="form-input"
                  required
                  value={shippingAddress.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra"
                />
              </div>
              <div className="form-group">
                <label className="form-label">PIN Code *</label>
                <input
                  type="text"
                  name="pincode"
                  className="form-input"
                  required
                  value={shippingAddress.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 400001"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="cart-card">
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} color="var(--teal-500)" />
              <span>2. Payment Option</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                border: paymentMethod === "Cash on Delivery" ? '2px solid var(--orange-500)' : '1px solid var(--gray-200)',
                borderRadius: '10px',
                cursor: 'pointer',
                background: paymentMethod === "Cash on Delivery" ? 'var(--orange-100)' : '#FFFFFF'
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash on Delivery"
                  checked={paymentMethod === "Cash on Delivery"}
                  onChange={() => setPaymentMethod("Cash on Delivery")}
                />
                <Banknote size={20} color="var(--orange-500)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>Cash on Delivery / Pay on Delivery (Recommended)</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Pay with cash or UPI QR upon doorstep delivery</div>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                border: paymentMethod === "UPI Instant Payment" ? '2px solid var(--orange-500)' : '1px solid var(--gray-200)',
                borderRadius: '10px',
                cursor: 'pointer',
                background: paymentMethod === "UPI Instant Payment" ? 'var(--orange-100)' : '#FFFFFF'
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI Instant Payment"
                  checked={paymentMethod === "UPI Instant Payment"}
                  onChange={() => setPaymentMethod("UPI Instant Payment")}
                />
                <CreditCard size={20} color="var(--teal-500)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>UPI / Google Pay / PhonePe / Paytm</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Instant verification via simulated UPI</div>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                border: paymentMethod === "Credit / Debit Card" ? '2px solid var(--orange-500)' : '1px solid var(--gray-200)',
                borderRadius: '10px',
                cursor: 'pointer',
                background: paymentMethod === "Credit / Debit Card" ? 'var(--orange-100)' : '#FFFFFF'
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Credit / Debit Card"
                  checked={paymentMethod === "Credit / Debit Card"}
                  onChange={() => setPaymentMethod("Credit / Debit Card")}
                />
                <CreditCard size={20} color="var(--navy-900)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>Credit / Debit Card (Visa, MasterCard, RuPay)</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Simulated secure 3D-secure card gateway</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Review */}
        <div className="summary-card">
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Order Items ({cartItems.length})</h3>

          <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
            {cartItems.map(({ product, quantity }) => (
              <div key={product._id} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
                <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#F8FAFC', borderRadius: '6px' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                    Qty: {quantity} × ₹{product.price.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>
                  ₹{(product.price * quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-line">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="summary-line">
            <span>Shipping</span>
            <span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit', fontWeight: 600 }}>
              {shipping === 0 ? "FREE" : `₹${shipping}`}
            </span>
          </div>

          <div className="summary-line total">
            <span>Payable Amount</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '20px' }}
            disabled={submitting}
          >
            <span>{submitting ? "Processing Order..." : `Place Order • ₹${total.toLocaleString('en-IN')}`}</span>
            <ArrowRight size={18} />
          </button>

          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--gray-500)' }}>
            🔒 Safe & encrypted multi-layer checkout
          </div>
        </div>
      </form>
    </div>
  );
};

