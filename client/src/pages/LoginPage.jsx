import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail("admin@electroelite.com");
    setPassword("admin123");
  };

  return (
    <div className="max-w" style={{ padding: '60px 20px' }}>
      <div className="form-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--navy-900)',
            color: 'var(--orange-500)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Zap size={24} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Welcome Back</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>
            Sign in to access your electronics orders and wishlist
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '18px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="e.g. sarang@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail size={16} color="var(--gray-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={16} color="var(--gray-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '10px' }}
            disabled={loading}
          >
            <span>{loading ? "Authenticating..." : "Sign In with Email"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Helper */}
        <div style={{
          marginTop: '24px',
          background: 'var(--warm-100)',
          border: '1px dashed var(--gray-300)',
          borderRadius: '10px',
          padding: '14px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '4px' }}>
            👑 Quick Testing (Admin Account)
          </div>
          <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '8px' }}>
            <code>admin@electroelite.com</code> / <code>admin123</code>
          </div>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="btn btn-outline btn-sm"
            style={{ background: '#FFFFFF', fontSize: '12px' }}
          >
            Auto-Fill Admin Credentials
          </button>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--gray-600)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--orange-500)', fontWeight: 700 }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

