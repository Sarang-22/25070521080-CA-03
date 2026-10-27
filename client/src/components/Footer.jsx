import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, Headphones, Zap } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer-main">
      <div className="max-w">
        {/* Value Propositions / Trust Badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          paddingBottom: '40px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '40px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(255, 107, 53, 0.15)', color: 'var(--orange-500)', padding: '12px', borderRadius: '10px' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '15px' }}>100% Genuine Brands</div>
              <div style={{ fontSize: '13px', color: '#94A3B8' }}>Direct manufacturer warranty</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(13, 148, 136, 0.15)', color: 'var(--teal-400)', padding: '12px', borderRadius: '10px' }}>
              <Truck size={24} />
            </div>
            <div>
              <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '15px' }}>Free Express Delivery</div>
              <div style={{ fontSize: '13px', color: '#94A3B8' }}>On all orders above ₹4,999</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(255, 107, 53, 0.15)', color: 'var(--orange-500)', padding: '12px', borderRadius: '10px' }}>
              <RefreshCw size={24} />
            </div>
            <div>
              <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '15px' }}>7-Day Easy Replacement</div>
              <div style={{ fontSize: '13px', color: '#94A3B8' }}>Hassle-free doorstep pickup</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(13, 148, 136, 0.15)', color: 'var(--teal-400)', padding: '12px', borderRadius: '10px' }}>
              <Headphones size={24} />
            </div>
            <div>
              <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '15px' }}>24/7 Tech Assistance</div>
              <div style={{ fontSize: '13px', color: '#94A3B8' }}>Dedicated customer support</div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="footer-grid">
          <div className="footer-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF', fontWeight: 800, fontSize: '20px', marginBottom: '14px' }}>
              <div style={{ width: '28px', height: '28px', background: 'var(--orange-500)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#FFFFFF" />
              </div>
              <span>ELECTRO<span style={{ color: 'var(--orange-500)' }}>ELITE</span></span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, maxWidth: '360px', marginBottom: '16px' }}>
              India's premier multi-brand retail destination for cutting-edge smartphones, 4K OLED televisions, smart inverter refrigerators, AI washing machines, and premium audio.
            </p>
            <div style={{ fontSize: '12px', color: 'var(--teal-400)' }}>
              Official Authorized Retailer for Apple, Samsung, Sony, LG, ASUS, Dell & Whirlpool.
            </div>
          </div>

          <div className="footer-col">
            <h5>Product Categories</h5>
            <ul className="footer-links">
              <li><Link to="/?category=Smartphones">Flagship Smartphones</Link></li>
              <li><Link to="/?category=Laptops">High-End Laptops</Link></li>
              <li><Link to="/?category=Televisions">4K & OLED Smart TVs</Link></li>
              <li><Link to="/?category=Refrigerators">Side-by-Side Refrigerators</Link></li>
              <li><Link to="/?category=Washing+Machines">AI Washing Machines</Link></li>
              <li><Link to="/?category=Air+Conditioners">Inverter Split ACs</Link></li>
              <li><Link to="/?category=Accessories">Audio & Accessories</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Customer Service</h5>
            <ul className="footer-links">
              <li><Link to="/orders">Track My Order</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/wishlist">My Wishlist</Link></li>
              <li><a href="#support">Warranty & Support</a></li>
              <li><a href="#faq">Frequently Asked Questions</a></li>
              <li><a href="#shipping">Shipping & Return Policy</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Contact & Security</h5>
            <ul className="footer-links">
              <li>📧 care@electroelite.com</li>
              <li>📞 Toll Free: 1800-419-0099</li>
              <li>🕒 Mon - Sun: 9:00 AM - 9:00 PM</li>
              <li style={{ marginTop: '12px' }}>
                <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', fontSize: '12px' }}>
                  🔒 256-Bit SSL Encrypted
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} ElectroElite Retail Private Limited. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Site Map</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

