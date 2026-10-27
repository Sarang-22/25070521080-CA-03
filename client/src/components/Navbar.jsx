import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  ShieldCheck,
  LogOut,
  Zap,
  Smartphone,
  Tv,
  Laptop,
  Wind,
  Layers,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  { name: "All", icon: Sparkles },
  { name: "Smartphones", icon: Smartphone },
  { name: "Laptops", icon: Laptop },
  { name: "Televisions", icon: Tv },
  { name: "Refrigerators", icon: Layers },
  { name: "Washing Machines", icon: Layers },
  { name: "Air Conditioners", icon: Wind },
  { name: "Accessories", icon: Zap }
];

export const Navbar = ({ selectedCategory, onSelectCategory, onSearch }) => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItemsCount, subtotal } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
    if (location.pathname !== "/") {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleCategoryClick = (catName) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    }
    if (location.pathname !== "/") {
      navigate(`/?category=${encodeURIComponent(catName)}`);
    }
  };

  return (
    <header>
      {/* Top Announcement Bar */}
      <div className="top-announcement">
        <div className="max-w top-announcement-inner">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="top-badge">FESTIVE SALE</span>
            <span>⚡ Up to 40% Off on Top Brands + Free Express Shipping Above ₹4,999</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
            <span>📞 24x7 Support: 1800-419-0099</span>
            <span style={{ color: '#10B981' }}>✓ 100% Genuine Warranty</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar-main">
        <div className="max-w navbar-row">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo" onClick={() => handleCategoryClick("All")}>
            <div className="brand-icon-box">
              <Zap size={22} strokeWidth={2.5} />
            </div>
            <span>ELECTRO<span className="brand-accent">ELITE</span></span>
          </Link>

          {/* Search Bar */}
          <form className="nav-search-bar" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="nav-search-input"
              placeholder="Search smartphones, OLED TVs, 5-star ACs, MacBooks, boAt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="nav-search-btn" title="Search">
              <Search size={16} />
            </button>
          </form>

          {/* Navigation Action Buttons */}
          <div className="nav-actions">
            {/* Wishlist */}
            <Link to="/wishlist" className="nav-btn" title="Wishlist">
              <Heart size={20} />
              <span style={{ display: 'none' }}>Wishlist</span>
              {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="nav-btn" title="Shopping Cart">
              <ShoppingCart size={20} />
              <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
              {totalItemsCount > 0 && <span className="badge-count">{totalItemsCount}</span>}
            </Link>

            {/* User Account / Admin */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isAdmin && (
                  <Link to="/admin" className="btn btn-teal btn-sm" style={{ padding: '6px 12px' }}>
                    <ShieldCheck size={16} />
                    <span>Admin</span>
                  </Link>
                )}
                <Link to="/orders" className="nav-btn" style={{ padding: '6px 10px' }} title="My Orders">
                  <User size={18} />
                  <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </span>
                </Link>
                <button onClick={logout} className="nav-btn" title="Logout" style={{ padding: '6px 10px' }}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/login" className="btn btn-primary btn-sm">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Category Horizontal Quick-Bar */}
        <div className="category-subnav">
          <div className="max-w category-subnav-inner">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isActive = (selectedCategory || "All").toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`cat-pill ${isActive ? 'active' : ''}`}
                  style={{ background: isActive ? 'var(--teal-500)' : 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <Icon size={14} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};

