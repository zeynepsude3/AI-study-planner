import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TYPE_CONFIG = {
  exam_prep: { icon: '📖', label: 'Exam Prep',   color: '#ef4444', bg: '#fef2f2' },
  task:      { icon: '✅', label: 'Task',         color: '#4f46e5', bg: '#eff0ff' },
  review:    { icon: '🔄', label: 'Review',       color: '#0ea5e9', bg: '#f0f9ff' },
};

const StudyPlanPage = () => {
  const [plan,     setPlan]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [lastGen,  setLastGen]  = useState(null);

  const generatePlan = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/plan');
      setPlan(res.data);
      setLastGen(new Date());
    } catch (err) {
      setError('Could not generate plan. Make sure you have courses, tasks, and exams added.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePlan();
  }, []);

  const totalHours = plan?.blocks?.reduce((s, b) => s + b.hours, 0) || 0;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>AI Study Plan</h1>
          <p style={s.sub}>
            {lastGen ? `Last generated: ${lastGen.toLocaleTimeString()}` : 'Generating your personalized plan...'}
          </p>
        </div>
        <button onClick={generatePlan} disabled={loading} style={s.genBtn}>
          {loading ? '⏳ Generating...' : '🤖 Regenerate Plan'}
        </button>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      {plan && (
        <>
          {/* Summary stats */}
          <div style={s.statsRow}>
            <div style={s.statCard}>
              <span style={{ ...s.statVal, color: '#4f46e5' }}>{plan.blocks?.length || 0}</span>
              <span style={s.statLabel}>Study Blocks</span>
            </div>
            <div style={s.statCard}>
              <span style={{ ...s.statVal, color: '#f97316' }}>{totalHours}h</span>
              <span style={s.statLabel}>Total Study Time</span>
            </div>
            <div style={s.statCard}>
              <span style={{ ...s.statVal, color: '#10b981' }}>{plan.summary?.overallProgress || 0}%</span>
              <span style={s.statLabel}>Overall Progress</span>
            </div>
            <div style={s.statCard}>
              <span style={{ ...s.statVal, color: '#8b5cf6' }}>{plan.summary?.topCourse || '—'}</span>
              <span style={s.statLabel}>Top Priority Course</span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={s.progressWrap}>
            <div style={s.progressBar}>
              <div style={{ ...s.progressFill, width: `${plan.summary?.overallProgress || 0}%` }} />
            </div>
            <span style={s.progressText}>{plan.summary?.overallProgress || 0}% of tasks completed</span>
          </div>

          {/* Study blocks */}
          {plan.blocks?.length === 0 ? (
            <div style={s.emptyState}>
              <p style={{ fontSize: 40, margin: 0 }}>🎉</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e', margin: '8px 0 4px' }}>You're all caught up!</p>
              <p style={{ fontSize: 13, color: '#9094a4', margin: 0 }}>No urgent tasks or upcoming exams. Add more tasks to get recommendations.</p>
            </div>
          ) : (
            <>
              <h2 style={s.sectionTitle}>Today's Study Plan</h2>
              <div style={s.blocksGrid}>
                {plan.blocks.map((block, i) => {
                  const cfg = TYPE_CONFIG[block.type] || TYPE_CONFIG.review;
                  return (
                    <div key={i} style={{ ...s.blockCard, borderTop: `3px solid ${cfg.color}` }}>
                      <div style={s.blockHeader}>
                        <div style={{ ...s.blockTypePill, background: cfg.bg, color: cfg.color }}>
                          {cfg.icon} {cfg.label}
                        </div>
                        <div style={{ ...s.priorityBadge, background: block.priority >= 8 ? '#fef2f2' : block.priority >= 5 ? '#fff4ed' : '#f0fdf4', color: block.priority >= 8 ? '#ef4444' : block.priority >= 5 ? '#f97316' : '#10b981' }}>
                          P{block.priority}
                        </div>
                      </div>
                      <p style={s.blockTitle}>{block.title}</p>
                      <p style={s.blockCourse}>{block.courseName}</p>
                      <div style={s.blockFooter}>
                        <span style={s.blockHours}>⏱ {block.hours}h</span>
                        <span style={s.blockReason}>{block.reason}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Daily schedule suggestion */}
              <h2 style={{ ...s.sectionTitle, marginTop: 28 }}>Suggested Daily Schedule</h2>
              <div style={s.scheduleCard}>
                {plan.blocks.map((block, i) => {
                  const cfg = TYPE_CONFIG[block.type] || TYPE_CONFIG.review;
                  const startHour = 9 + plan.blocks.slice(0, i).reduce((s, b) => s + b.hours, 0);
                  const endHour = startHour + block.hours;
                  const fmt = (h) => `${Math.floor(h)}:${h % 1 === 0.5 ? '30' : '00'}`;
                  return (
                    <div key={i} style={s.scheduleRow}>
                      <span style={s.scheduleTime}>{fmt(startHour)} – {fmt(endHour)}</span>
                      <div style={{ ...s.scheduleBlock, borderLeft: `3px solid ${cfg.color}`, background: cfg.bg }}>
                        <span style={{ fontSize: 14 }}>{cfg.icon}</span>
                        <div>
                          <p style={s.scheduleTitle}>{block.title}</p>
                          <p style={s.scheduleMeta}>{block.courseName} · {block.hours}h</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {loading && !plan && (
        <div style={s.loadingState}>
          <div style={s.spinner} />
          <p style={{ color: '#9094a4', marginTop: 16 }}>Analyzing your courses, tasks and exams...</p>
        </div>
      )}
    </div>
  );
};

const s = {
  page:          { padding: '28px', maxWidth: 1000, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" },
  header:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #e8eaf0' },
  title:         { margin: 0, fontSize: 24, fontWeight: 700, color: '#1a1a2e' },
  sub:           { margin: '4px 0 0', fontSize: 13, color: '#9094a4' },
  genBtn:        { background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  errorBox:      { background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '12px 16px', fontSize: 13, marginBottom: 20, border: '1px solid #fecaca' },
  statsRow:      { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 },
  statCard:      { background: 'white', borderRadius: 12, padding: '16px 20px', border: '1px solid #e8eaf0', display: 'flex', flexDirection: 'column' },
  statVal:       { fontSize: 22, fontWeight: 700 },
  statLabel:     { fontSize: 11, color: '#9094a4', marginTop: 4 },
  progressWrap:  { background: 'white', borderRadius: 12, padding: '16px 20px', border: '1px solid #e8eaf0', marginBottom: 24 },
  progressBar:   { height: 8, background: '#f0f1f7', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill:  { height: '100%', background: 'linear-gradient(90deg, #4f46e5, #818cf8)', borderRadius: 4, transition: 'width 0.5s ease' },
  progressText:  { fontSize: 12, color: '#9094a4' },
  sectionTitle:  { fontSize: 15, fontWeight: 600, color: '#1a1a2e', margin: '0 0 14px' },
  blocksGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 },
  blockCard:     { background: 'white', borderRadius: 12, padding: '16px', border: '1px solid #e8eaf0' },
  blockHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  blockTypePill: { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
  priorityBadge: { fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 },
  blockTitle:    { margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#1a1a2e' },
  blockCourse:   { margin: '0 0 10px', fontSize: 11, color: '#9094a4' },
  blockFooter:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  blockHours:    { fontSize: 12, fontWeight: 600, color: '#4f46e5' },
  blockReason:   { fontSize: 11, color: '#9094a4' },
  scheduleCard:  { background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #e8eaf0', display: 'flex', flexDirection: 'column', gap: 12 },
  scheduleRow:   { display: 'flex', alignItems: 'center', gap: 14 },
  scheduleTime:  { fontSize: 12, color: '#9094a4', fontWeight: 500, minWidth: 100, textAlign: 'right' },
  scheduleBlock: { flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8 },
  scheduleTitle: { margin: 0, fontSize: 13, fontWeight: 500, color: '#1a1a2e' },
  scheduleMeta:  { margin: '2px 0 0', fontSize: 11, color: '#9094a4' },
  emptyState:    { background: 'white', borderRadius: 12, padding: '48px', border: '1px solid #e8eaf0', textAlign: 'center' },
  loadingState:  { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0' },
  spinner:       { width: 36, height: 36, border: '3px solid #e8eaf0', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
};

export default StudyPlanPage;
