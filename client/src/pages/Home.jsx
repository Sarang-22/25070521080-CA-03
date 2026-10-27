import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import {
  Sparkles,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Smartphone,
  Tv,
  Laptop,
  Wind,
  Layers,
  Zap,
  RotateCcw
} from 'lucide-react';

const BRANDS = ["All", "Apple", "Samsung", "Sony", "LG", "ASUS", "Dell", "HP", "Whirlpool", "Daikin", "OnePlus", "boAt"];
const CATEGORIES = ["All", "Smartphones", "Laptops", "Televisions", "Refrigerators", "Washing Machines", "Air Conditioners", "Accessories"];

export const Home = ({ selectedCategory, setSelectedCategory, searchKeyword, setSearchKeyword }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter & Sort States
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState(350000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  // Sync category & search from URL if present
  useEffect(() => {
    const urlCat = searchParams.get("category");
    const urlSearch = searchParams.get("search");
    if (urlCat) setSelectedCategory(urlCat);
    if (urlSearch) setSearchKeyword(urlSearch);
  }, [searchParams]);

  // Fetch products from backend
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchKeyword) params.append("search", searchKeyword);
      if (selectedCategory && selectedCategory !== "All") params.append("category", selectedCategory);
      if (selectedBrand && selectedBrand !== "All") params.append("brand", selectedBrand);
      if (inStockOnly) params.append("inStock", "true");
      if (priceRange) params.append("maxPrice", priceRange);
      if (sortBy) params.append("sort", sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      } else {
        setError(data.message || "Failed to load catalog");
      }
    } catch (err) {
      setError(err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, priceRange, inStockOnly, sortBy, searchKeyword]);

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedBrand("All");
    setPriceRange(350000);
    setInStockOnly(false);
    setSortBy("featured");
    setSearchKeyword("");
    setSearchParams({});
  };

  const featuredDeals = products.filter(p => p.featured).slice(0, 4);

  return (
    <div>
      {/* HERO BANNER */}
      {!searchKeyword && selectedCategory === "All" && (
        <section className="hero-banner">
          <div className="max-w hero-content">
            <div>
              <div className="hero-tag">
                <Sparkles size={14} />
                <span>Next-Gen Electronics 2026</span>
              </div>
              <h1 className="hero-title">
                Experience Pure Power & Premium Design.
              </h1>
              <p className="hero-desc">
                From titanium flagship smartphones and 4K OLED displays to AI-driven home appliances and studio sound. Genuine warranty included.
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <a href="#shop-section" className="btn btn-primary btn-lg">
                  <span>Explore Catalog</span>
                  <ArrowRight size={18} />
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("Smartphones")}
                  className="btn btn-outline btn-lg"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  Flagship Phones
                </button>
              </div>

              <div className="hero-badges-row">
                <div className="hero-stat">
                  <b>25+ Models</b>
                  <span>Top Global Brands</span>
                </div>
                <div className="hero-stat">
                  <b>100% Genuine</b>
                  <span>Brand Warranty</span>
                </div>
                <div className="hero-stat">
                  <b>Free Express</b>
                  <span>Doorstep Delivery</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Cards */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                borderRadius: '24px',
                padding: '24px',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                width: '100%',
                maxWidth: '400px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ background: 'var(--orange-500)', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '4px' }}>
                    FEATURED TECH
                  </span>
                  <span style={{ color: 'var(--teal-400)', fontSize: '13px', fontWeight: 600 }}>Apple • Sony • Samsung</span>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=700&q=80"
                  alt="Sony Bravia OLED"
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }}
                />
                <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
                  Sony BRAVIA 65-inch XR 4K OLED TV
                </div>
                <div style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '12px' }}>
                  Acoustic Surface Audio+ with Pure XR OLED Contrast
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>₹2,19,900</span>
                    <span style={{ fontSize: '12px', color: '#64748B', textDecoration: 'line-through', marginLeft: '8px' }}>₹2,49,900</span>
                  </div>
                  <span style={{ color: 'var(--teal-400)', fontSize: '12px', fontWeight: 700 }}>In Stock (9 units)</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* BRAND QUICK FILTER BAR */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid var(--gray-200)', padding: '16px 0' }}>
        <div className="max-w" style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
            Top Brands:
          </span>
          {BRANDS.map(brand => (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedBrand(brand)}
              style={{
                background: selectedBrand === brand ? 'var(--navy-900)' : 'var(--gray-100)',
                color: selectedBrand === brand ? '#FFFFFF' : 'var(--gray-700)',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {brand}
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED FLAGSHIP ROW */}
      {featuredDeals.length > 0 && !searchKeyword && selectedCategory === "All" && selectedBrand === "All" && (
        <section style={{ padding: '40px 0 10px' }}>
          <div className="max-w">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--orange-500)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <Flame size={16} />
                  <span>Spotlight Deals</span>
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: 800 }}>Flagship Electronics Picks</h2>
              </div>
              <a href="#shop-section" style={{ color: 'var(--teal-600)', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All Catalog <ArrowRight size={16} />
              </a>
            </div>

            <div className="products-grid">
              {featuredDeals.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MAIN SHOP SECTION WITH FILTERS */}
      <section id="shop-section" className="max-w">
        <div className="shop-layout">
          {/* SIDEBAR FILTERS */}
          <aside className="filter-card">
            <div className="filter-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={18} />
                <span>Filters</span>
              </span>
              {(selectedCategory !== "All" || selectedBrand !== "All" || inStockOnly || searchKeyword) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  style={{ background: 'none', border: 'none', color: 'var(--orange-500)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RotateCcw size={12} /> Reset
                </button>
              )}
            </div>

            {/* Categories Filter */}
            <div className="filter-group">
              <div className="filter-subtitle">Categories</div>
              {CATEGORIES.map(cat => (
                <label key={cat} className="filter-option">
                  <input
                    type="radio"
                    name="category_filter"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>

            {/* Brand Filter */}
            <div className="filter-group">
              <div className="filter-subtitle">Brand</div>
              {BRANDS.map(brand => (
                <label key={brand} className="filter-option">
                  <input
                    type="radio"
                    name="brand_filter"
                    checked={selectedBrand === brand}
                    onChange={() => setSelectedBrand(brand)}
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>

            {/* Price Range Slider */}
            <div className="filter-group">
              <div className="filter-subtitle">Max Price: ₹{priceRange.toLocaleString('en-IN')}</div>
              <input
                type="range"
                min="3000"
                max="350000"
                step="5000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--orange-500)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--gray-500)', marginTop: '4px' }}>
                <span>₹3,000</span>
                <span>₹3,50,000</span>
              </div>
            </div>

            {/* In-Stock Only */}
            <div className="filter-group">
              <label className="filter-option" style={{ fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>In-Stock Items Only</span>
              </label>
            </div>
          </aside>

          {/* PRODUCTS CATALOG LIST */}
          <main>
            {/* Sort & Results Bar */}
            <div className="sort-bar">
              <div style={{ fontSize: '14px', color: 'var(--gray-700)', fontWeight: 600 }}>
                Showing <span style={{ color: 'var(--orange-500)' }}>{products.length}</span> electronics
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
                {selectedBrand !== "All" && ` by ${selectedBrand}`}
                {searchKeyword && ` matching "${searchKeyword}"`}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="sort-select" style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Sort by:</label>
                <select
                  id="sort-select"
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="featured">Featured Picks</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            {/* Loading Skeleton / Empty State / Products Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-500)' }}>
                <Sparkles size={32} style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 12px' }} />
                <p>Loading premium electronics catalog...</p>
              </div>
            ) : products.length === 0 ? (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid var(--gray-200)',
                padding: '60px 20px',
                textAlign: 'center'
              }}>
                <Zap size={48} style={{ color: 'var(--orange-500)', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No matching electronics found</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginBottom: '20px' }}>
                  Try adjusting your filters, price range, or searching for a different brand or product.
                </p>
                <button type="button" onClick={resetFilters} className="btn btn-primary">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
};

