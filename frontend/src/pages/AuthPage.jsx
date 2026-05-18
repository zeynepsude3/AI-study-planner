import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form,    setForm]    = useState({ name: '', email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register }   = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.logoWrap}>📚</div>
          <h1 style={s.heroTitle}>Study smarter,<br />not harder.</h1>
          <p style={s.heroSub}>AI-powered planning that adapts to your schedule, priorities, and exam dates.</p>
          <div style={s.features}>
            {['Personalized daily study plans', 'Exam countdown & reminders', 'AI-driven task prioritization', 'Progress tracking across courses'].map(f => (
              <div key={f} style={s.featureItem}>
                <span style={s.featureCheck}>✓</span>
                <span style={s.featureText}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>{isLogin ? 'Welcome back' : 'Create account'}</h2>
          <p style={s.cardSub}>{isLogin ? 'Log in to your study dashboard' : 'Start planning smarter today'}</p>
          <div style={s.tabs}>
            <button onClick={() => setIsLogin(true)}  style={{ ...s.tab, ...(isLogin  ? s.tabActive : {}) }}>Login</button>
            <button onClick={() => setIsLogin(false)} style={{ ...s.tab, ...(!isLogin ? s.tabActive : {}) }}>Register</button>
          </div>
          <form onSubmit={handleSubmit} style={s.form}>
            {!isLogin && (
              <div style={s.field}>
                <label style={s.label}>Full Name</label>
                <input type="text" required placeholder="Your name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} style={s.input} />
              </div>
            )}
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input type="email" required placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} style={s.input} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input type="password" required placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} style={s.input} />
            </div>
            {error && <div style={s.errorBox}>{error}</div>}
            <button type="submit" disabled={loading} style={s.submitBtn}>
              {loading ? 'Please wait...' : (isLogin ? 'Login →' : 'Create Account →')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const s = {
  page:        { minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif" },
  left:        { flex: 1, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' },
  leftContent: { maxWidth: 400 },
  logoWrap:    { fontSize: 40, marginBottom: 32 },
  heroTitle:   { margin: '0 0 16px', fontSize: 36, fontWeight: 700, color: 'white', lineHeight: 1.2 },
  heroSub:     { margin: '0 0 32px', fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 },
  features:    { display: 'flex', flexDirection: 'column', gap: 12 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 12 },
  featureCheck:{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', fontWeight: 700, flexShrink: 0 },
  featureText: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  right:       { flex: 1, background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' },
  card:        { background: 'white', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 400, border: '1px solid #e8eaf0' },
  cardTitle:   { margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#1a1a2e' },
  cardSub:     { margin: '0 0 24px', fontSize: 14, color: '#9094a4' },
  tabs:        { display: 'flex', background: '#f4f5f9', borderRadius: 10, marginBottom: 24, padding: 4 },
  tab:         { flex: 1, border: 'none', background: 'none', padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontSize: 14, color: '#9094a4', fontWeight: 500 },
  tabActive:   { background: 'white', color: '#4f46e5', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  form:        { display: 'flex', flexDirection: 'column', gap: 16 },
  field:       { display: 'flex', flexDirection: 'column', gap: 6 },
  label:       { fontSize: 13, fontWeight: 600, color: '#4a4e6a' },
  input:       { border: '1.5px solid #e0e2ed', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', color: '#1a1a2e' },
  errorBox:    { background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 13, border: '1px solid #fecaca' },
  submitBtn:   { background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, padding: '12px', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
};

export default AuthPage;
