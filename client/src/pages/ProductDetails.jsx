import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import {
  Star,
  ShoppingCart,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Share2
} from 'lucide-react';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProduct(data.product);
          // Fetch related products in same category
          fetch(`/api/products?category=${encodeURIComponent(data.product.category)}`)
            .then(r => r.json())
            .then(catData => {
              if (catData.success) {
                setRelated(catData.products.filter(p => p._id !== data.product._id).slice(0, 4));
              }
            });
        } else {
          setError(data.message || "Product not found");
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-500)' }}>Loading product specifications...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '12px' }}>Product Not Found</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>{error || "The requested item could not be retrieved."}</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Storefront
        </Link>
      </div>
    );
  }

  const isFavorite = isInWishlist(product._id);
  const isOutOfStock = product.quantity <= 0;
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2500);
  };

  return (
    <div className="max-w" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--gray-500)', marginBottom: '16px' }}>
        <Link to="/" style={{ color: 'var(--teal-600)' }}>Home</Link>
        <span>/</span>
        <Link to={`/?category=${encodeURIComponent(product.category)}`} style={{ color: 'var(--teal-600)' }}>{product.category}</Link>
        <span>/</span>
        <span style={{ color: 'var(--gray-700)', fontWeight: 600 }}>{product.brand}</span>
      </div>

      {/* Main Details Grid */}
      <div className="details-grid">
        {/* Left: Product Images Gallery */}
        <div className="details-gallery">
          <div className="details-main-img-box">
            <img
              src={product.image}
              alt={product.name}
              className="details-main-img"
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              border: '2px solid var(--orange-500)',
              borderRadius: '8px',
              padding: '6px',
              background: '#F8FAFC',
              cursor: 'pointer'
            }}>
              <img src={product.image} alt="Thumbnail 1" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="details-info-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{
              background: 'var(--teal-100)',
              color: 'var(--teal-600)',
              fontSize: '12px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {product.brand} Official
            </span>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              style={{
                background: 'none',
                border: '1px solid var(--gray-200)',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: isFavorite ? 'var(--danger)' : 'var(--gray-700)',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
              <span>{isFavorite ? "In Wishlist" : "Wishlist"}</span>
            </button>
          </div>

          <h1 style={{ fontSize: '28px', marginTop: '12px', marginBottom: '8px' }}>
            {product.name}
          </h1>

          {/* Rating & Reviews */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span className="rating-pill" style={{ padding: '4px 10px', fontSize: '13px' }}>
              <Star size={14} fill="currentColor" />
              {product.rating ? Number(product.rating).toFixed(1) : "4.8"}
            </span>
            <span style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
              {product.reviewsCount || 42} Customer Ratings & Verified Reviews
            </span>
          </div>

          {/* Price Box */}
          <div style={{
            background: 'var(--warm-50)',
            border: '1px solid var(--gray-200)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--navy-900)', fontFamily: 'var(--font-heading)' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span style={{ fontSize: '18px', color: 'var(--gray-400)', textDecoration: 'line-through' }}>
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discountPercent > 0 && (
                <span style={{ background: 'var(--orange-100)', color: 'var(--orange-500)', fontWeight: 800, fontSize: '13px', padding: '3px 8px', borderRadius: '4px' }}>
                  {discountPercent}% OFF
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>
              Inclusive of all taxes. Free express shipping applied.
            </div>
          </div>

          {/* Stock Status Bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
              {isOutOfStock ? (
                <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={18} /> Currently Out of Stock
                </span>
              ) : (
                <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={18} /> In Stock ({product.quantity} units available for dispatch)
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p style={{ color: 'var(--gray-700)', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
            {product.description}
          </p>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
            {!isOutOfStock && (
              <div className="qty-stepper">
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty(q => Math.min(product.quantity, q + 1))}>+</button>
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart size={20} />
              <span>{isOutOfStock ? "Out of Stock" : `Add to Cart • ₹${(product.price * qty).toLocaleString('en-IN')}`}</span>
            </button>
          </div>

          {addedMessage && (
            <div style={{ background: '#ECFDF5', color: '#047857', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
              ✓ Added {qty} item(s) to your shopping cart!
            </div>
          )}

          {/* Guarantee Badges */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            borderTop: '1px solid var(--gray-200)',
            paddingTop: '18px',
            fontSize: '12px',
            color: 'var(--gray-700)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} color="var(--teal-500)" />
              <span>100% Genuine</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={18} color="var(--orange-500)" />
              <span>Fast Dispatch</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={18} color="var(--teal-500)" />
              <span>7-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Technical Specifications Sheet */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <section style={{
          background: '#FFFFFF',
          border: '1px solid var(--gray-200)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '40px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px', color: 'var(--navy-900)' }}>
            Technical Specifications Sheet
          </h3>
          <table className="spec-table">
            <tbody>
              {Object.entries(product.specs).map(([key, val]) => (
                <tr key={key}>
                  <th>{key}</th>
                  <td>{val}</td>
                </tr>
              ))}
              <tr>
                <th>Category</th>
                <td>{product.category}</td>
              </tr>
              <tr>
                <th>Brand Manufacturer</th>
                <td>{product.brand}</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {/* Related Products in this Category */}
      {related.length > 0 && (
        <section>
          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>
            Similar {product.category} You Might Like
          </h3>
          <div className="products-grid">
            {related.map(item => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

