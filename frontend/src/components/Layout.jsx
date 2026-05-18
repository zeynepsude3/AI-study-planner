import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard',  icon: '⊞', label: 'Dashboard'  },
  { to: '/courses',    icon: '📚', label: 'Courses'    },
  { to: '/tasks',      icon: '✅', label: 'Tasks'      },
  { to: '/exams',      icon: '📅', label: 'Exams'      },
  { to: '/study-plan', icon: '🤖', label: 'Study Plan' },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.brand}>
          <div style={s.brandIcon}>📚</div>
          <div>
            <div style={s.brandName}>StudyPlanner</div>
            <div style={s.brandSub}>AI-powered</div>
          </div>
        </div>
        <nav style={s.nav}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({ ...s.navItem, ...(isActive ? s.navActive : {}) })}>
              <span style={s.navIcon}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div style={s.userArea}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || '?'}</div>
          <div style={s.userInfo}>
            <p style={s.userName}>{user?.name}</p>
            <p style={s.userEmail}>{user?.email}</p>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} style={s.logoutBtn} title="Logout">↩</button>
        </div>
      </aside>
      <main style={s.main}><Outlet /></main>
    </div>
  );
};

const s = {
  shell:     { display: 'flex', minHeight: '100vh', background: '#f8f9fc', fontFamily: "'DM Sans', sans-serif" },
  sidebar:   { width: 230, background: 'white', display: 'flex', flexDirection: 'column', padding: '24px 0', borderRight: '1px solid #e8eaf0', position: 'sticky', top: 0, height: '100vh' },
  brand:     { display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px 24px', borderBottom: '1px solid #f0f1f7' },
  brandIcon: { width: 36, height: 36, background: '#eff0ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  brandName: { fontWeight: 700, fontSize: 15, color: '#1a1a2e' },
  brandSub:  { fontSize: 11, color: '#9094a4', marginTop: 1 },
  nav:       { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem:   { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#6b7280', fontSize: 14, fontWeight: 500 },
  navActive: { background: '#eff0ff', color: '#4f46e5' },
  navIcon:   { fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 },
  userArea:  { display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px 0', borderTop: '1px solid #f0f1f7', margin: '0 4px' },
  avatar:    { width: 34, height: 34, borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 },
  userInfo:  { flex: 1, overflow: 'hidden' },
  userName:  { margin: 0, fontSize: 13, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { margin: 0, fontSize: 11, color: '#9094a4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#c0c4d8', padding: 4 },
  main:      { flex: 1, overflow: 'auto' },
};

export default Layout;
