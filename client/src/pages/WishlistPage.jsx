import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';

export const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          background: '#FEF2F2',
          color: 'var(--danger)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <Heart size={36} />
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '10px' }}>Your Wishlist is Empty</h2>
        <p style={{ color: 'var(--gray-500)', maxWidth: '420px', margin: '0 auto 24px' }}>
          Save your favorite smartphones, laptops, TVs, and accessories here to keep track of prices and stock.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          <ArrowLeft size={18} /> Discover Electronics
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>My Wishlist ({wishlist.length})</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
            Saved electronics and future wish items
          </p>
        </div>
        <Link to="/" className="btn btn-outline btn-sm">
          <ArrowLeft size={14} /> Continue Shopping
        </Link>
      </div>

      <div className="products-grid">
        {wishlist.map(product => {
          const isOutOfStock = product.quantity <= 0;
          return (
            <div key={product._id} className="product-card">
              <div className="product-thumb-wrap">
                <Link to={`/product/${product._id}`}>
                  <img src={product.image} alt={product.name} className="product-thumb" />
                </Link>
                <button
                  type="button"
                  onClick={() => removeFromWishlist(product._id)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#FFFFFF',
                    border: '1px solid var(--gray-200)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--danger)',
                    cursor: 'pointer'
                  }}
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="product-body">
                <div className="product-brand">{product.brand}</div>
                <Link to={`/product/${product._id}`}>
                  <h3 className="product-name">{product.name}</h3>
                </Link>

                <div className="product-price-row">
                  <div>
                    <span className="current-price">₹{product.price.toLocaleString('en-IN')}</span>
                    {product.originalPrice > product.price && (
                      <span className="original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  <span className={`product-stock-tag ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
                    {isOutOfStock ? "Out of Stock" : "In Stock"}
                  </span>
                </div>

                <div className="product-card-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={isOutOfStock}
                    onClick={() => {
                      addToCart(product, 1);
                      removeFromWishlist(product._id);
                    }}
                  >
                    <ShoppingCart size={15} />
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

