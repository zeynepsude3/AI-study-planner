import React, { useState, useEffect } from 'react';
import api from '../services/api';

const COLORS = ['#4f46e5','#10b981','#ef4444','#8b5cf6','#f97316','#0ea5e9'];

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [form,    setForm]    = useState({ name: '', credits: 3, difficulty: 'medium', color: COLORS[0] });
  const [show,    setShow]    = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => { api.get('/courses').then(r => setCourses(r.data)); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/courses', form);
      setCourses(prev => [...prev, res.data]);
      setForm({ name: '', credits: 3, difficulty: 'medium', color: COLORS[0] });
      setShow(false);
    } catch (err) { setError(err.response?.data?.error || 'Error adding course'); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/courses/${id}`);
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const diffLabel = { easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard' };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>My Courses</h1>
          <p style={s.sub}>{courses.length} course{courses.length !== 1 ? 's' : ''} added</p>
        </div>
        <button onClick={() => setShow(!show)} style={s.addBtn}>+ Add Course</button>
      </div>

      {show && (
        <form onSubmit={handleAdd} style={s.formCard}>
          <h3 style={s.formTitle}>New Course</h3>
          <div style={s.formRow}>
            <input required placeholder="Course name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} style={s.input} />
          </div>
          <div style={s.formRow}>
            <select value={form.credits} onChange={e => setForm({ ...form, credits: +e.target.value })} style={s.select}>
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Credits</option>)}
            </select>
            <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} style={s.select}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div style={s.colorRow}>
            <span style={s.colorLabel}>Color:</span>
            {COLORS.map(c => (
              <button type="button" key={c} onClick={() => setForm({ ...form, color: c })}
                style={{ ...s.colorDot, background: c, outline: form.color === c ? `3px solid ${c}` : 'none', outlineOffset: 3 }} />
            ))}
          </div>
          {error && <p style={s.error}>{error}</p>}
          <div style={s.formActions}>
            <button type="button" onClick={() => setShow(false)} style={s.cancelBtn}>Cancel</button>
            <button type="submit" style={s.submitBtn}>Add Course</button>
          </div>
        </form>
      )}

      <div style={s.grid}>
        {courses.length === 0 && <p style={s.empty}>No courses yet. Add your first course above.</p>}
        {courses.map(course => (
          <div key={course.id} style={{ ...s.courseCard, borderTop: `3px solid ${course.color}` }}>
            <div style={s.courseHeader}>
              <div style={{ ...s.courseIcon, background: course.color + '18', color: course.color }}>
                {course.name[0].toUpperCase()}
              </div>
              <button onClick={() => handleDelete(course.id)} style={s.deleteBtn}>✕</button>
            </div>
            <h3 style={s.courseName}>{course.name}</h3>
            <div style={s.courseMeta}>
              <span style={{ ...s.badge, background: course.color + '15', color: course.color }}>{course.credits} Credits</span>
              <span style={s.badge}>{diffLabel[course.difficulty]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const s = {
  page:        { padding: '28px', maxWidth: 1000, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #e8eaf0' },
  title:       { margin: 0, fontSize: 24, fontWeight: 700, color: '#1a1a2e' },
  sub:         { margin: '4px 0 0', fontSize: 13, color: '#9094a4' },
  addBtn:      { background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  formCard:    { background: 'white', borderRadius: 12, padding: 24, marginBottom: 24, border: '1px solid #e8eaf0' },
  formTitle:   { margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#1a1a2e' },
  formRow:     { display: 'flex', gap: 12, marginBottom: 12 },
  input:       { flex: 1, border: '1.5px solid #e0e2ed', borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', color: '#1a1a2e' },
  select:      { flex: 1, border: '1.5px solid #e0e2ed', borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', color: '#1a1a2e', background: 'white' },
  colorRow:    { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
  colorLabel:  { fontSize: 13, color: '#9094a4', fontWeight: 500 },
  colorDot:    { width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer' },
  error:       { background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '8px 12px', fontSize: 13 },
  formActions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  cancelBtn:   { background: '#f0f4f8', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 14, cursor: 'pointer', color: '#6b7280' },
  submitBtn:   { background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  courseCard:  { background: 'white', borderRadius: 12, padding: '18px 20px', border: '1px solid #e8eaf0' },
  courseHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  courseIcon:  { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 },
  deleteBtn:   { background: 'none', border: 'none', color: '#d0d3de', cursor: 'pointer', fontSize: 13 },
  courseName:  { margin: '0 0 10px', fontSize: 14, fontWeight: 600, color: '#1a1a2e' },
  courseMeta:  { display: 'flex', gap: 8, flexWrap: 'wrap' },
  badge:       { fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#f0f4f8', color: '#6b7280', fontWeight: 500 },
  empty:       { color: '#c0c4d8', fontSize: 14, fontStyle: 'italic', gridColumn: '1/-1' },
};

export default CoursesPage;
