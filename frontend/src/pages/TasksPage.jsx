import React, { useState, useEffect } from 'react';
import api from '../services/api';

const STATUSES = ['pending', 'in_progress', 'done', 'skipped'];
const STATUS_LABELS = {
  pending:     { label: 'Pending',     color: '#6b7280', bg: '#f4f5f9' },
  in_progress: { label: 'In Progress', color: '#f97316', bg: '#fff4ed' },
  done:        { label: 'Done',        color: '#10b981', bg: '#f0fdf4' },
  skipped:     { label: 'Skipped',     color: '#ef4444', bg: '#fef2f2' },
};
const PRIORITIES = [1, 2, 3, 4, 5];

const TasksPage = () => {
  const [tasks,   setTasks]   = useState([]);
  const [courses, setCourses] = useState([]);
  const [show,    setShow]    = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter,  setFilter]  = useState('all');
  const [form,    setForm]    = useState({ title: '', description: '', courseId: '', dueDate: '', priority: 3, estimatedHours: 1, status: 'pending' });
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get('/tasks').then(r => setTasks(r.data));
    api.get('/courses').then(r => setCourses(r.data));
  }, []);

  const resetForm = () => {
    setForm({ title: '', description: '', courseId: '', dueDate: '', priority: 3, estimatedHours: 1, status: 'pending' });
    setEditing(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        const res = await api.put(`/tasks/${editing}`, form);
        setTasks(prev => prev.map(t => t.id === editing ? res.data : t));
      } else {
        const res = await api.post('/tasks', form);
        setTasks(prev => [...prev, res.data]);
      }
      setShow(false);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Error saving task');
    }
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title, description: task.description || '',
      courseId: task.courseId || '', dueDate: task.dueDate || '',
      priority: task.priority, estimatedHours: task.estimatedHours,
      status: task.status
    });
    setEditing(task.id);
    setShow(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleStatus = async (id, status) => {
    const res = await api.put(`/tasks/${id}`, { status });
    setTasks(prev => prev.map(t => t.id === id ? res.data : t));
  };

  const daysUntil = (date) => {
    if (!date) return null;
    return Math.ceil((new Date(date) - new Date()) / 86400000);
  };

  const urgencyColor = (days) => {
    if (days === null) return '#6b7280';
    if (days <= 0) return '#ef4444';
    if (days <= 2) return '#f97316';
    if (days <= 7) return '#eab308';
    return '#10b981';
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: tasks.filter(t => t.status === s).length }), {});

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Tasks</h1>
          <p style={s.sub}>{tasks.length} total · {counts.done} completed</p>
        </div>
        <button onClick={() => { resetForm(); setShow(true); }} style={s.addBtn}>+ Add Task</button>
      </div>

      {/* Filter tabs */}
      <div style={s.filterRow}>
        {[['all', 'All', tasks.length], ['pending', 'Pending', counts.pending], ['in_progress', 'In Progress', counts.in_progress], ['done', 'Done', counts.done], ['skipped', 'Skipped', counts.skipped]].map(([val, label, count]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ ...s.filterBtn, ...(filter === val ? s.filterActive : {}) }}>
            {label} <span style={s.filterCount}>{count}</span>
          </button>
        ))}
      </div>

      {/* Form */}
      {show && (
        <form onSubmit={handleSubmit} style={s.formCard}>
          <h3 style={s.formTitle}>{editing ? 'Edit Task' : 'New Task'}</h3>
          <div style={s.formRow}>
            <div style={{ ...s.field, flex: 2 }}>
              <label style={s.label}>Title *</label>
              <input required placeholder="Task title" value={form.title}
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
              <label style={s.label}>Due Date</label>
              <input type="date" value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })} style={s.input} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: +e.target.value })} style={s.select}>
                {PRIORITIES.map(p => <option key={p} value={p}>{'★'.repeat(p)} ({p})</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Est. Hours</label>
              <input type="number" min="0.5" max="24" step="0.5" value={form.estimatedHours}
                onChange={e => setForm({ ...form, estimatedHours: +e.target.value })} style={s.input} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={s.select}>
                {STATUSES.map(st => <option key={st} value={st}>{STATUS_LABELS[st].label}</option>)}
              </select>
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Description</label>
            <textarea placeholder="Optional notes..." value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ ...s.input, minHeight: 60, resize: 'vertical' }} />
          </div>
          {error && <div style={s.errorBox}>{error}</div>}
          <div style={s.formActions}>
            <button type="button" onClick={() => { setShow(false); resetForm(); }} style={s.cancelBtn}>Cancel</button>
            <button type="submit" style={s.submitBtn}>{editing ? 'Update Task' : 'Add Task'}</button>
          </div>
        </form>
      )}

      {/* Task list */}
      <div style={s.list}>
        {filtered.length === 0 && <p style={s.empty}>No tasks found.</p>}
        {filtered.map(task => {
          const days = daysUntil(task.dueDate);
          const st   = STATUS_LABELS[task.status];
          const course = courses.find(c => c.id === task.courseId);
          return (
            <div key={task.id} style={{ ...s.taskCard, borderLeft: `4px solid ${urgencyColor(days)}` }}>
              <div style={s.taskMain}>
                <div style={s.taskLeft}>
                  <button
                    onClick={() => handleStatus(task.id, task.status === 'done' ? 'pending' : 'done')}
                    style={{ ...s.checkbox, background: task.status === 'done' ? '#10b981' : 'white', borderColor: task.status === 'done' ? '#10b981' : '#d0d3de' }}>
                    {task.status === 'done' && <span style={{ color: 'white', fontSize: 11 }}>✓</span>}
                  </button>
                  <div>
                    <p style={{ ...s.taskTitle, textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? '#b0b4c8' : '#1a1a2e' }}>
                      {task.title}
                    </p>
                    <div style={s.taskMeta}>
                      {course && <span style={{ ...s.metaPill, background: (course.color || '#4f46e5') + '18', color: course.color || '#4f46e5' }}>{course.name}</span>}
                      <span style={{ ...s.metaPill, background: st.bg, color: st.color }}>{st.label}</span>
                      <span style={s.metaText}>{'★'.repeat(task.priority)}</span>
                      <span style={s.metaText}>{task.estimatedHours}h</span>
                      {task.dueDate && (
                        <span style={{ ...s.metaPill, background: urgencyColor(days) + '18', color: urgencyColor(days) }}>
                          {days <= 0 ? 'Overdue' : days === 1 ? 'Tomorrow' : `${days}d left`}
                        </span>
                      )}
                    </div>
                    {task.description && <p style={s.taskDesc}>{task.description}</p>}
                  </div>
                </div>
                <div style={s.taskActions}>
                  <select value={task.status}
                    onChange={e => handleStatus(task.id, e.target.value)}
                    style={s.statusSelect}>
                    {STATUSES.map(st => <option key={st} value={st}>{STATUS_LABELS[st].label}</option>)}
                  </select>
                  <button onClick={() => handleEdit(task)} style={s.editBtn}>✏️</button>
                  <button onClick={() => handleDelete(task.id)} style={s.deleteBtn}>🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const s = {
  page:        { padding: '28px', maxWidth: 1000, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #e8eaf0' },
  title:       { margin: 0, fontSize: 24, fontWeight: 700, color: '#1a1a2e' },
  sub:         { margin: '4px 0 0', fontSize: 13, color: '#9094a4' },
  addBtn:      { background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  filterRow:   { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  filterBtn:   { background: 'white', border: '1.5px solid #e8eaf0', borderRadius: 20, padding: '6px 14px', fontSize: 13, cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 },
  filterActive:{ background: '#eff0ff', borderColor: '#4f46e5', color: '#4f46e5' },
  filterCount: { background: '#e8eaf0', borderRadius: 10, padding: '1px 7px', fontSize: 11 },
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
  list:        { display: 'flex', flexDirection: 'column', gap: 10 },
  taskCard:    { background: 'white', borderRadius: 10, padding: '14px 18px', border: '1px solid #e8eaf0' },
  taskMain:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  taskLeft:    { display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 },
  checkbox:    { width: 22, height: 22, borderRadius: 6, border: '1.5px solid #d0d3de', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  taskTitle:   { margin: '0 0 6px', fontSize: 14, fontWeight: 500 },
  taskMeta:    { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metaPill:    { fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500 },
  metaText:    { fontSize: 11, color: '#9094a4' },
  taskDesc:    { margin: '6px 0 0', fontSize: 12, color: '#9094a4' },
  taskActions: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  statusSelect:{ border: '1.5px solid #e0e2ed', borderRadius: 6, padding: '4px 8px', fontSize: 12, outline: 'none', color: '#1a1a2e', background: 'white', cursor: 'pointer' },
  editBtn:     { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '4px 6px' },
  deleteBtn:   { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '4px 6px' },
  empty:       { color: '#c0c4d8', fontSize: 14, fontStyle: 'italic', textAlign: 'center', padding: '40px 0' },
};

export default TasksPage;
