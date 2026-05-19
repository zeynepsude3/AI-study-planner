import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminPage = () => {
  const { user } = useAuth();
  const [users,  setUsers]  = useState([]);
  const [stats,  setStats]  = useState(null);
  const [tab,    setTab]    = useState('users');
  const [loading,setLoading]= useState(true);
  const [error,  setError]  = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([api.get('/admin/users'), api.get('/admin/stats')]);
      setUsers(u.data);
      setStats(s.data);
    } catch (err) {
      setError('Admin access required or failed to load data.');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      fetchAll();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      const res = await api.put(`/admin/users/${id}/role`, { role });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: res.data.role } : u));
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
  };

  if (user?.role !== 'admin') return (
    <div style={s.page}>
      <div style={s.noAccess}>
        <p style={{ fontSize: 40, margin: 0 }}>🔒</p>
        <h2 style={{ color: '#1a1a2e', margin: '8px 0 4px' }}>Admin Access Required</h2>
        <p style={{ color: '#9094a4', margin: 0 }}>You need admin privileges to view this page.</p>
      </div>
    </div>
  );

  if (loading) return <div style={s.page}><p style={{ color: '#9094a4' }}>Loading...</p></div>;
  if (error)   return <div style={s.page}><p style={{ color: '#ef4444' }}>{error}</p></div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Admin Panel</h1>
          <p style={s.sub}>System management and monitoring</p>
        </div>
      </div>

      {stats && (
        <div style={s.statsRow}>
          {[
            { label: 'Total Users',     value: stats.totalUsers,    color: '#4f46e5' },
            { label: 'Total Courses',   value: stats.totalCourses,  color: '#0ea5e9' },
            { label: 'Total Tasks',     value: stats.totalTasks,    color: '#f97316' },
            { label: 'Total Exams',     value: stats.totalExams,    color: '#ef4444' },
            { label: 'Tasks Done',      value: stats.doneTasks,     color: '#10b981' },
            { label: 'Completion Rate', value: `${stats.completionRate}%`, color: '#8b5cf6' },
          ].map(({ label, value, color }) => (
            <div key={label} style={s.statCard}>
              <span style={{ ...s.statValue, color }}>{value}</span>
              <span style={s.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      )}

      <div style={s.tabs}>
        <button onClick={() => setTab('users')} style={{ ...s.tab, ...(tab === 'users' ? s.tabActive : {}) }}>👥 Users ({users.length})</button>
        <button onClick={() => setTab('stats')} style={{ ...s.tab, ...(tab === 'stats' ? s.tabActive : {}) }}>📊 System Stats</button>
      </div>

      {tab === 'users' && (
        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr style={s.theadRow}>
                <th style={s.th}>Name</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Role</th>
                <th style={s.th}>Joined</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ background: i % 2 === 0 ? '#f8f9fc' : 'white' }}>
                  <td style={s.td}>
                    <div style={s.avatar}>{u.name[0].toUpperCase()}</div>
                    <span style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 500 }}>{u.name}</span>
                  </td>
                  <td style={s.td}><span style={{ fontSize: 13, color: '#6b7280' }}>{u.email}</span></td>
                  <td style={s.td}>
                    <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                      disabled={u.id === user.id}
                      style={{ ...s.roleSelect, background: u.role === 'admin' ? '#eff0ff' : '#f0fdf4', color: u.role === 'admin' ? '#4f46e5' : '#10b981' }}>
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={s.td}><span style={{ fontSize: 12, color: '#9094a4' }}>{new Date(u.createdAt).toLocaleDateString('en-GB')}</span></td>
                  <td style={s.td}>
                    {u.id !== user.id
                      ? <button onClick={() => handleDelete(u.id)} style={s.deleteBtn}>🗑️ Delete</button>
                      : <span style={{ fontSize: 12, color: '#c0c4d8' }}>You</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'stats' && stats && (
        <div style={s.card}>
          <h3 style={s.sectionTitle}>User Distribution</h3>
          <div style={s.statsGrid}>
            <div style={s.statBox}><span style={{ fontSize: 32, fontWeight: 700, color: '#4f46e5' }}>{stats.studentUsers}</span><span style={s.smallLabel}>Students</span></div>
            <div style={s.statBox}><span style={{ fontSize: 32, fontWeight: 700, color: '#ef4444' }}>{stats.adminUsers}</span><span style={s.smallLabel}>Admins</span></div>
          </div>
          <h3 style={s.sectionTitle}>Task Statistics</h3>
          <div style={s.statsGrid}>
            <div style={s.statBox}><span style={{ fontSize: 32, fontWeight: 700, color: '#10b981' }}>{stats.doneTasks}</span><span style={s.smallLabel}>Done</span></div>
            <div style={s.statBox}><span style={{ fontSize: 32, fontWeight: 700, color: '#f97316' }}>{stats.pendingTasks}</span><span style={s.smallLabel}>Pending</span></div>
            <div style={s.statBox}><span style={{ fontSize: 32, fontWeight: 700, color: '#8b5cf6' }}>{stats.completionRate}%</span><span style={s.smallLabel}>Completion</span></div>
          </div>
          <h3 style={s.sectionTitle}>Content Overview</h3>
          <div style={s.statsGrid}>
            {[['Courses', stats.totalCourses, '#0ea5e9'], ['Tasks', stats.totalTasks, '#f97316'], ['Exams', stats.totalExams, '#ef4444']].map(([l,v,c]) => (
              <div key={l} style={s.statBox}><span style={{ fontSize: 32, fontWeight: 700, color: c }}>{v}</span><span style={s.smallLabel}>{l}</span></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  page:        { padding: '28px', maxWidth: 1100, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #e8eaf0' },
  title:       { margin: 0, fontSize: 24, fontWeight: 700, color: '#1a1a2e' },
  sub:         { margin: '4px 0 0', fontSize: 13, color: '#9094a4' },
  statsRow:    { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 },
  statCard:    { background: 'white', borderRadius: 10, padding: '14px 16px', border: '1px solid #e8eaf0', display: 'flex', flexDirection: 'column' },
  statValue:   { fontSize: 22, fontWeight: 700 },
  statLabel:   { fontSize: 11, color: '#9094a4', marginTop: 4 },
  tabs:        { display: 'flex', gap: 8, marginBottom: 16 },
  tab:         { background: 'white', border: '1.5px solid #e8eaf0', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', color: '#6b7280', fontWeight: 500 },
  tabActive:   { background: '#eff0ff', borderColor: '#4f46e5', color: '#4f46e5' },
  card:        { background: 'white', borderRadius: 12, border: '1px solid #e8eaf0', overflow: 'hidden' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  theadRow:    { background: '#f8f9fc', borderBottom: '2px solid #e8eaf0' },
  th:          { padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#6b7280', textAlign: 'left' },
  td:          { padding: '10px 16px', borderBottom: '1px solid #f4f5f9', verticalAlign: 'middle' },
  avatar:      { width: 28, height: 28, borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, marginRight: 8 },
  roleSelect:  { border: '1.5px solid #e0e2ed', borderRadius: 6, padding: '4px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none' },
  deleteBtn:   { background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' },
  noAccess:    { textAlign: 'center', padding: '80px 0' },
  sectionTitle:{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: '0 0 14px', padding: '16px 20px 0' },
  statsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, padding: '0 20px 20px' },
  statBox:     { background: '#f8f9fc', borderRadius: 10, padding: '16px', border: '1px solid #e8eaf0', display: 'flex', flexDirection: 'column' },
  smallLabel:  { fontSize: 12, color: '#9094a4', marginTop: 4 },
};

export default AdminPage;