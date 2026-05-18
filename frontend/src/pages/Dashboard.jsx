import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user }  = useAuth();
  const [tasks,   setTasks]   = useState([]);
  const [exams,   setExams]   = useState([]);
  const [recs,    setRecs]    = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/tasks'), api.get('/exams'), api.get('/ai/recommendations'), api.get('/ai/progress')])
      .then(([t, e, r, s]) => { setTasks(t.data); setExams(e.data); setRecs(r.data); setSummary(s.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markDone = async (id) => {
    await api.put(`/tasks/${id}`, { status: 'done' });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'done' } : t));
  };

  const daysUntil = (date) => Math.ceil((new Date(date) - new Date()) / 86400000);
  const urgencyColor = (days) => days <= 0 ? '#ef4444' : days <= 2 ? '#f97316' : days <= 7 ? '#eab308' : '#10b981';

  const todayTasks    = tasks.filter(t => t.dueDate && daysUntil(t.dueDate) <= 1 && t.status !== 'done');
  const upcomingExams = exams.filter(e => new Date(e.examDate) >= new Date()).slice(0, 4);

  if (loading) return (
    <div style={s.centered}>
      <div style={s.spinner} />
      <p style={{ color: '#9094a4', marginTop: 16, fontSize: 14 }}>Loading your dashboard...</p>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.topbar}>
        <div>
          <h1 style={s.greeting}>Good day, <span style={s.accent}>{user?.name?.split(' ')[0]}</span> 👋</h1>
          <p style={s.subtext}>Here's your study overview for today</p>
        </div>
        {summary && (
          <div style={s.progressBadge}>
            <span style={s.progressNum}>{summary.overallProgress}%</span>
            <span style={s.progressLabel}>Overall Progress</span>
          </div>
        )}
      </div>

      {summary && (
        <div style={s.statsRow}>
          {[
            { label: 'Pending Tasks',    value: tasks.filter(t => t.status !== 'done').length, color: '#4f46e5' },
            { label: 'Upcoming Exams',   value: upcomingExams.length,                          color: '#ef4444' },
            { label: 'Study Hours Today',value: `${summary.totalStudyHours}h`,                 color: '#8b5cf6' },
            { label: 'Tasks Done',       value: tasks.filter(t => t.status === 'done').length, color: '#10b981' },
          ].map(({ label, value, color }) => (
            <div key={label} style={s.statCard}>
              <span style={{ ...s.statValue, color }}>{value}</span>
              <span style={s.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      )}

      <div style={s.grid}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>📋 Today's Tasks</h2>
          {todayTasks.length === 0 ? <p style={s.empty}>No urgent tasks for today 🎉</p> : todayTasks.map(task => (
            <div key={task.id} style={s.taskItem}>
              <div style={s.taskLeft}>
                <button onClick={() => markDone(task.id)}
                  style={{ ...s.checkbox, background: task.status === 'done' ? '#10b981' : 'white', borderColor: task.status === 'done' ? '#10b981' : '#d0d3de' }}>
                  {task.status === 'done' && <span style={{ color: 'white', fontSize: 10 }}>✓</span>}
                </button>
                <div>
                  <p style={{ ...s.taskTitle, textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? '#b0b4c8' : '#1a1a2e' }}>{task.title}</p>
                  <p style={s.taskMeta}>{'★'.repeat(task.priority)}{'☆'.repeat(5 - task.priority)}</p>
                </div>
              </div>
              <span style={{ ...s.urgencyPill, background: urgencyColor(daysUntil(task.dueDate)) + '18', color: urgencyColor(daysUntil(task.dueDate)) }}>
                {daysUntil(task.dueDate) <= 0 ? 'Today' : `${daysUntil(task.dueDate)}d`}
              </span>
            </div>
          ))}
        </div>

        <div style={s.card}>
          <h2 style={s.cardTitle}>📅 Upcoming Exams</h2>
          {upcomingExams.length === 0 ? <p style={s.empty}>No upcoming exams</p> : upcomingExams.map(exam => {
            const days = daysUntil(exam.examDate);
            const col  = urgencyColor(days);
            return (
              <div key={exam.id} style={s.examItem}>
                <div style={{ ...s.examBadge, background: col + '15' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: col, lineHeight: 1 }}>{days}</span>
                  <span style={{ fontSize: 9, color: col }}>days</span>
                </div>
                <div>
                  <p style={s.examTitle}>{exam.title}</p>
                  <p style={s.examDate}>{new Date(exam.examDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ ...s.card, gridColumn: 'span 2' }}>
          <h2 style={s.cardTitle}>🤖 AI Study Recommendations</h2>
          {recs.length === 0 ? <p style={s.empty}>Add courses, tasks and exams to get personalized recommendations</p> : (
            <div style={s.recsGrid}>
              {recs.map((rec, i) => (
                <div key={i} style={s.recCard}>
                  <div style={s.recHeader}>
                    <span style={{ ...s.recTypePill, background: '#eff0ff', color: '#4f46e5' }}>
                      {rec.type === 'exam_prep' ? 'EXAM PREP' : rec.type === 'task' ? 'URGENT TASK' : 'REVIEW'}
                    </span>
                  </div>
                  <p style={s.recTitle}>{rec.title}</p>
                  <p style={s.recMeta}>{rec.hours}h · {rec.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const s = {
  page:         { padding: '28px', maxWidth: 1100, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" },
  centered:     { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' },
  spinner:      { width: 36, height: 36, border: '3px solid #e8eaf0', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  topbar:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid #e8eaf0' },
  greeting:     { margin: 0, fontSize: 24, fontWeight: 700, color: '#1a1a2e' },
  accent:       { color: '#4f46e5' },
  subtext:      { margin: '4px 0 0', fontSize: 13, color: '#9094a4' },
  progressBadge:{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#eff0ff', borderRadius: 12, padding: '12px 24px', border: '1px solid #c7d2fe' },
  progressNum:  { fontSize: 28, fontWeight: 700, color: '#4f46e5' },
  progressLabel:{ fontSize: 11, color: '#818cf8', marginTop: 2 },
  statsRow:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard:     { background: 'white', borderRadius: 12, padding: '16px 20px', border: '1px solid #e8eaf0', display: 'flex', flexDirection: 'column' },
  statValue:    { fontSize: 28, fontWeight: 700 },
  statLabel:    { fontSize: 12, color: '#9094a4', marginTop: 4 },
  grid:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card:         { background: 'white', borderRadius: 14, padding: '22px 24px', border: '1px solid #e8eaf0' },
  cardTitle:    { margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#1a1a2e' },
  empty:        { color: '#c0c4d8', fontSize: 13, fontStyle: 'italic' },
  taskItem:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f4f5f9' },
  taskLeft:     { display: 'flex', alignItems: 'center', gap: 10 },
  checkbox:     { width: 20, height: 20, borderRadius: 5, border: '1.5px solid #d0d3de', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  taskTitle:    { margin: 0, fontSize: 13, fontWeight: 500 },
  taskMeta:     { margin: '2px 0 0', fontSize: 11, color: '#fbbf24' },
  urgencyPill:  { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
  examItem:     { display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid #f4f5f9' },
  examBadge:    { width: 46, height: 46, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  examTitle:    { margin: 0, fontSize: 13, fontWeight: 500, color: '#1a1a2e' },
  examDate:     { margin: '2px 0 0', fontSize: 11, color: '#9094a4' },
  recsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 },
  recCard:      { background: '#f8f9fc', borderRadius: 10, padding: '14px 16px', border: '1px solid #e8eaf0' },
  recHeader:    { marginBottom: 8 },
  recTypePill:  { fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20 },
  recTitle:     { margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#1a1a2e' },
  recMeta:      { margin: 0, fontSize: 11, color: '#9094a4' },
};

export default Dashboard;
