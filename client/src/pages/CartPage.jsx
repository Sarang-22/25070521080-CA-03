import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ArrowRight, ArrowLeft, ShoppingBag, ShieldCheck } from 'lucide-react';

export const CartPage = () => {
  const { cartItems, updateQty, removeFromCart, clearCart, subtotal, shipping, total, totalItemsCount } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          background: 'var(--orange-100)',
          color: 'var(--orange-500)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <ShoppingBag size={36} />
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '10px' }}>Your Shopping Cart is Empty</h2>
        <p style={{ color: 'var(--gray-500)', maxWidth: '420px', margin: '0 auto 24px' }}>
          Explore our wide range of flagship smartphones, OLED televisions, smart appliances, and premium audio.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          <ArrowLeft size={18} /> Start Shopping Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Shopping Cart</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
            You have {totalItemsCount} item{totalItemsCount > 1 ? 's' : ''} in your cart
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          style={{ background: 'none', border: 'none', color: 'var(--gray-500)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Clear All Items
        </button>
      </div>

      <div className="cart-layout">
        {/* Left: Cart Items List */}
        <div className="cart-card">
          {cartItems.map(({ product, quantity }) => (
            <div key={product._id} className="cart-item-row">
              <Link to={`/product/${product._id}`}>
                <img src={product.image} alt={product.name} className="cart-item-thumb" />
              </Link>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal-600)', textTransform: 'uppercase' }}>
                  {product.brand}
                </div>
                <Link to={`/product/${product._id}`} style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '15px', display: 'block', marginBottom: '4px' }}>
                  {product.name}
                </Link>
                <div style={{ fontSize: '14px', color: 'var(--navy-900)', fontWeight: 600 }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="qty-stepper">
                <button type="button" onClick={() => updateQty(product._id, -1)}>-</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => updateQty(product._id, 1)}>+</button>
              </div>

              {/* Total & Remove */}
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--navy-900)', fontFamily: 'var(--font-heading)' }}>
                  ₹{(product.price * quantity).toLocaleString('en-IN')}
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(product._id)}
                  style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', padding: '4px' }}
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--gray-100)' }}>
            <Link to="/" style={{ color: 'var(--teal-600)', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="summary-card">
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '18px', color: 'var(--navy-900)' }}>
            Order Summary
          </h3>

          <div className="summary-line">
            <span>Items Subtotal</span>
            <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="summary-line">
            <span>Estimated Shipping</span>
            <span style={{ fontWeight: 600, color: shipping === 0 ? 'var(--success)' : 'inherit' }}>
              {shipping === 0 ? "FREE" : `₹${shipping}`}
            </span>
          </div>

          {shipping === 0 && (
            <div style={{ fontSize: '12px', color: 'var(--teal-600)', background: 'var(--teal-100)', padding: '6px 10px', borderRadius: '6px', marginBottom: '12px' }}>
              ✓ Free Express Shipping Qualified
            </div>
          )}

          <div className="summary-line total">
            <span>Total Amount</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '20px' }}
            onClick={() => navigate('/checkout')}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </button>

          <div style={{ marginTop: '18px', fontSize: '12px', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            <ShieldCheck size={16} color="var(--teal-500)" />
            <span>Encrypted 256-bit Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

