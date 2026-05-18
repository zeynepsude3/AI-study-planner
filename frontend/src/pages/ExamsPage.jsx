import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ExamsPage = () => {
  const [exams,   setExams]   = useState([]);
  const [courses, setCourses] = useState([]);
  const [show,    setShow]    = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState({ title: '', courseId: '', examDate: '', duration: 90, location: '', notes: '' });
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get('/exams').then(r => setExams(r.data));
    api.get('/courses').then(r => setCourses(r.data));
  }, []);

  const resetForm = () => {
    setForm({ title: '', courseId: '', examDate: '', duration: 90, location: '', notes: '' });
    setEditing(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        const res = await api.put(`/exams/${editing}`, form);
        setExams(prev => prev.map(ex => ex.id === editing ? res.data : ex));
      } else {
        const res = await api.post('/exams', form);
        setExams(prev => [...prev, res.data].sort((a, b) => new Date(a.examDate) - new Date(b.examDate)));
      }
      setShow(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Error saving exam');
    }
  };

  const handleEdit = (exam) => {
    setForm({
      title: exam.title, courseId: exam.courseId || '',
      examDate: exam.examDate, duration: exam.duration,
      location: exam.location || '', notes: exam.notes || ''
    });
    setEditing(exam.id);
    setShow(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    await api.delete(`/exams/${id}`);
    setExams(prev => prev.filter(e => e.id !== id));
  };

  const daysUntil = (date) => Math.ceil((new Date(date) - new Date()) / 86400000);

  const urgencyColor = (days) => {
    if (days < 0)  return { color: '#6b7280', bg: '#f4f5f9', label: 'Past' };
    if (days === 0) return { color: '#ef4444', bg: '#fef2f2', label: 'Today!' };
    if (days <= 2)  return { color: '#ef4444', bg: '#fef2f2', label: `${days}d left` };
    if (days <= 7)  return { color: '#f97316', bg: '#fff4ed', label: `${days}d left` };
    if (days <= 14) return { color: '#eab308', bg: '#fefce8', label: `${days}d left` };
    return { color: '#10b981', bg: '#f0fdf4', label: `${days}d left` };
  };

  const upcoming = exams.filter(e => daysUntil(e.examDate) >= 0);
  const past     = exams.filter(e => daysUntil(e.examDate) < 0);

  const ExamCard = ({ exam }) => {
    const days   = daysUntil(exam.examDate);
    const urg    = urgencyColor(days);
    const course = courses.find(c => c.id === exam.courseId);
    return (
      <div style={{ ...s.examCard, borderTop: `3px solid ${urg.color}` }}>
        <div style={s.examHeader}>
          <div style={{ ...s.daysBadge, background: urg.bg }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: urg.color, lineHeight: 1 }}>{Math.abs(days)}</span>
            <span style={{ fontSize: 10, color: urg.color }}>{days < 0 ? 'days ago' : 'days'}</span>
          </div>
          <div style={s.examInfo}>
            <p style={s.examTitle}>{exam.title}</p>
            <div style={s.examMeta}>
              {course && <span style={{ ...s.metaPill, background: (course.color || '#4f46e5') + '18', color: course.color || '#4f46e5' }}>{course.name}</span>}
              <span style={{ ...s.metaPill, background: urg.bg, color: urg.color }}>{urg.label}</span>
              <span style={s.metaText}>
                {new Date(exam.examDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span style={s.metaText}>{exam.duration} min</span>
              {exam.location && <span style={s.metaText}>📍 {exam.location}</span>}
            </div>
            {exam.notes && <p style={s.examNotes}>{exam.notes}</p>}
          </div>
          <div style={s.examActions}>
            <button onClick={() => handleEdit(exam)} style={s.editBtn}>✏️</button>
            <button onClick={() => handleDelete(exam.id)} style={s.deleteBtn}>🗑️</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Exams</h1>
          <p style={s.sub}>{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <button onClick={() => { resetForm(); setShow(true); }} style={s.addBtn}>+ Add Exam</button>
      </div>

      {show && (
        <form onSubmit={handleSubmit} style={s.formCard}>
          <h3 style={s.formTitle}>{editing ? 'Edit Exam' : 'New Exam'}</h3>
          <div style={s.formRow}>
            <div style={{ ...s.field, flex: 2 }}>
              <label style={s.label}>Exam Title *</label>
              <input required placeholder="e.g. Software Architecture Final" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} style={s.input} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Course</label>
              <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} style={s.select}>
                <option value="">— No course —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.field}>
              <label style={s.label}>Exam Date *</label>
              <input required type="date" value={form.examDate}
                onChange={e => setForm({ ...form, examDate: e.target.value })} style={s.input} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Duration (min)</label>
              <input type="number" min="15" max="300" step="15" value={form.duration}
                onChange={e => setForm({ ...form, duration: +e.target.value })} style={s.input} />
            </div>
            <div style={{ ...s.field, flex: 2 }}>
              <label style={s.label}>Location</label>
              <input placeholder="e.g. Room A101" value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })} style={s.input} />
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Notes</label>
            <textarea placeholder="Optional notes..." value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              style={{ ...s.input, minHeight: 60, resize: 'vertical' }} />
          </div>
          {error && <div style={s.errorBox}>{error}</div>}
          <div style={s.formActions}>
            <button type="button" onClick={() => { setShow(false); resetForm(); }} style={s.cancelBtn}>Cancel</button>
            <button type="submit" style={s.submitBtn}>{editing ? 'Update Exam' : 'Add Exam'}</button>
          </div>
        </form>
      )}

      {upcoming.length === 0 && !show && <p style={s.empty}>No upcoming exams. Add your first exam above.</p>}

      {upcoming.length > 0 && (
        <>
          <h2 style={s.sectionTitle}>Upcoming</h2>
          <div style={s.grid}>{upcoming.map(e => <ExamCard key={e.id} exam={e} />)}</div>
        </>
      )}

      {past.length > 0 && (
        <>
          <h2 style={{ ...s.sectionTitle, color: '#9094a4', marginTop: 28 }}>Past</h2>
          <div style={s.grid}>{past.map(e => <ExamCard key={e.id} exam={e} />)}</div>
        </>
      )}
    </div>
  );
};

const s = {
  page:        { padding: '28px', maxWidth: 1000, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #e8eaf0' },
  title:       { margin: 0, fontSize: 24, fontWeight: 700, color: '#1a1a2e' },
  sub:         { margin: '4px 0 0', fontSize: 13, color: '#9094a4' },
  addBtn:      { background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  formCard:    { background: 'white', borderRadius: 12, padding: 24, marginBottom: 20, border: '1px solid #e8eaf0' },
  formTitle:   { margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#1a1a2e' },
  formRow:     { display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' },
  field:       { display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 120 },
  label:       { fontSize: 12, fontWeight: 600, color: '#4a4e6a' },
  input:       { border: '1.5px solid #e0e2ed', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', color: '#1a1a2e', fontFamily: "'DM Sans', sans-serif" },
  select:      { border: '1.5px solid #e0e2ed', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', color: '#1a1a2e', background: 'white' },
  errorBox:    { background: '#fef2f2', color: '#ef4444', borderRadius: 8, padding: '8px 12px', fontSize: 13, marginBottom: 12, border: '1px solid #fecaca' },
  formActions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  cancelBtn:   { background: '#f4f5f9', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer', color: '#6b7280' },
  submitBtn:   { background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  sectionTitle:{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', margin: '0 0 12px' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 },
  examCard:    { background: 'white', borderRadius: 12, padding: '16px 18px', border: '1px solid #e8eaf0' },
  examHeader:  { display: 'flex', alignItems: 'flex-start', gap: 14 },
  daysBadge:   { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 12, flexShrink: 0 },
  examInfo:    { flex: 1 },
  examTitle:   { margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: '#1a1a2e' },
  examMeta:    { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metaPill:    { fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500 },
  metaText:    { fontSize: 11, color: '#9094a4' },
  examNotes:   { margin: '6px 0 0', fontSize: 12, color: '#9094a4' },
  examActions: { display: 'flex', gap: 4, flexShrink: 0 },
  editBtn:     { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '4px' },
  deleteBtn:   { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '4px' },
  empty:       { color: '#c0c4d8', fontSize: 14, fontStyle: 'italic', textAlign: 'center', padding: '40px 0' },
};

export default ExamsPage;
