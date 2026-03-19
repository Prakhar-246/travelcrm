import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>✈️</div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>TravelCRM</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>TravelandHolidays.in — Sign in to continue</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="admin@travelandholidays.in"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} type="submit" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</> : '🔐 Sign In'}
            </button>
          </form>
          <div style={{ marginTop: 20, padding: '12px 14px', background: 'rgba(79,140,255,.08)', borderRadius: 8, border: '1px solid rgba(79,140,255,.2)' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, fontWeight: 700 }}>DEFAULT CREDENTIALS</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Email: <strong>admin@travelandholidays.in</strong></div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Password: <strong>admin123</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
