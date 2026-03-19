import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Modal, EmptyState, fmtDate } from '../../components/common';

const EMPTY = { title:'', message:'', type:'followup', dueDate:'', priority:'medium' };
const TYPES  = ['payment','followup','hotel','transport','document','custom'];
const PRIORITY_COLOR = { high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--success)' };
const TYPE_ICON = { payment:'💰', followup:'📞', hotel:'🏨', transport:'🚕', document:'📄', custom:'🔔' };

export default function Reminders() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('pending'); // pending | done
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reminders', { params: { isDone: filter === 'done' } });
      setItems(data.data);
    } catch { toast.error('Failed to load reminders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter]); // eslint-disable-line

  const handleSave = async () => {
    if (!form.title || !form.message || !form.dueDate) return toast.error('Fill required fields');
    setSaving(true);
    try { await api.post('/reminders', form); toast.success('Reminder set'); setModal(false); fetch(); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const markDone = async (id) => {
    try { await api.put(`/reminders/${id}/done`); toast.success('Marked done ✅'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/reminders/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const isOverdue = (d) => new Date(d) < new Date();
  const f = v => setForm(p => ({ ...p, ...v }));

  return (
    <div className="page-enter">
      <div className="filter-row">
        <button className={`chip${filter === 'pending' ? ' active' : ''}`} onClick={() => setFilter('pending')}>⏰ Pending</button>
        <button className={`chip${filter === 'done' ? ' active' : ''}`} onClick={() => setFilter('done')}>✅ Done</button>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary btn-sm" onClick={() => { setForm(EMPTY); setModal(true); }}>➕ Add Reminder</button>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
        items.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(r => (
              <div key={r._id} className="card card-sm" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, borderLeft: `3px solid ${PRIORITY_COLOR[r.priority]}` }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {TYPE_ICON[r.type] || '🔔'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{r.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>{r.message}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="tag">{r.type}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: PRIORITY_COLOR[r.priority] }}>{r.priority.toUpperCase()}</span>
                    <span style={{ fontSize: 11, color: isOverdue(r.dueDate) && !r.isDone ? 'var(--danger)' : 'var(--text3)', fontWeight: isOverdue(r.dueDate) ? 700 : 400 }}>
                      {isOverdue(r.dueDate) && !r.isDone ? '⚠️ Overdue — ' : '📅 Due: '}{fmtDate(r.dueDate)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {!r.isDone && <button className="btn btn-success btn-sm" onClick={() => markDone(r._id)}>✅ Done</button>}
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={filter === 'pending' ? '🔔' : '✅'} message={filter === 'pending' ? 'No pending reminders' : 'No completed reminders'} action={filter === 'pending' && <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>➕ Add Reminder</button>} />
        )
      )}

      {modal && (
        <Modal title="New Reminder" onClose={() => setModal(false)}>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e => f({ title: e.target.value })} placeholder="e.g. Follow up with Rahul Sharma" /></div>
            <div className="form-group"><label className="form-label">Message *</label><textarea className="form-textarea" value={form.message} onChange={e => f({ message: e.target.value })} placeholder="Reminder details..." style={{ minHeight: 60 }} /></div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={e => f({ type: e.target.value })}>
                  {TYPES.map(t => <option key={t} value={t}>{TYPE_ICON[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={e => f({ priority: e.target.value })}>
                  {['high','medium','low'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Due Date *</label><input className="form-input" type="date" value={form.dueDate} onChange={e => f({ dueDate: e.target.value })} /></div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳' : '🔔 Set Reminder'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
