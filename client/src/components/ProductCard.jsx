import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Star, ShoppingCart, Heart, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorite = isInWishlist(product._id);
  const isOutOfStock = product.quantity <= 0;
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card">
      {/* Badge / Pill */}
      {product.badge && (
        <span className={`product-badge ${product.badge.toLowerCase() === 'flagship' ? 'flagship' : ''}`}>
          {product.badge}
        </span>
      )}

      {/* Wishlist Button */}
      <button
        type="button"
        className={`product-wishlist-btn ${isFavorite ? 'active' : ''}`}
        onClick={() => toggleWishlist(product)}
        title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
      </button>

      {/* Product Thumbnail */}
      <Link to={`/product/${product._id}`} className="product-thumb-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-thumb"
          loading="lazy"
        />
      </Link>

      {/* Card Content */}
      <div className="product-body">
        <div className="product-brand">{product.brand}</div>
        <Link to={`/product/${product._id}`}>
          <h3 className="product-name" title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Rating & Stock */}
        <div className="product-rating">
          <span className="rating-pill">
            <Star size={12} fill="currentColor" />
            {product.rating ? Number(product.rating).toFixed(1) : "4.8"}
          </span>
          <span>({product.reviewsCount || 42} reviews)</span>
        </div>

        {/* Key Specification Preview */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {Object.entries(product.specs)[0][0]}: {Object.entries(product.specs)[0][1]}
          </div>
        )}

        {/* Stock tag */}
        <div>
          <span className={`product-stock-tag ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
            {isOutOfStock ? 'Out of Stock' : `In Stock (${product.quantity} left)`}
          </span>
        </div>

        {/* Price & Action */}
        <div className="product-price-row">
          <div>
            <span className="current-price">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice > product.price && (
              <span className="original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
            {discountPercent > 0 && (
              <div style={{ fontSize: '11px', color: 'var(--orange-500)', fontWeight: 700 }}>
                Save {discountPercent}%
              </div>
            )}
          </div>
        </div>

        <div className="product-card-actions">
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
          >
            <ShoppingCart size={15} />
            <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

