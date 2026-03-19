import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Modal, Avatar, StatusBadge, fmtDate } from '../../components/common';

const EMPTY = { name:'', email:'', password:'', role:'sales', phone:'' };

export default function Users() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await api.get('/users'); setUsers(data.data); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('Fill all required fields');
    setSaving(true);
    try { await api.post('/users', form); toast.success('User created'); setModal(false); fetch(); }
    catch (err) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id) => {
    try { await api.put(`/users/${id}/toggle`); toast.success('Updated'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const f = v => setForm(p => ({ ...p, ...v }));
  const roleColor = { admin: 'var(--danger)', sales: 'var(--accent)', operations: 'var(--accent3)' };

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm(EMPTY); setModal(true); }}>➕ Add User</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Role</th><th>Phone</th><th>Status</th><th>Last Seen</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={u.name} />
                        <div><strong>{u.name}</strong><div className="text-muted">{u.email}</div></div>
                      </div>
                    </td>
                    <td>
                      <span className="tag" style={{ color: roleColor[u.role], borderColor: roleColor[u.role] + '44', background: roleColor[u.role] + '11' }}>
                        {u.role === 'admin' ? '👑' : u.role === 'sales' ? '🧲' : '⚙️'} {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    <td className="text-muted">{u.phone || '—'}</td>
                    <td><StatusBadge status={u.isActive ? 'booked' : 'lost'} /></td>
                    <td className="text-muted">{fmtDate(u.lastSeen)}</td>
                    <td>
                      <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleActive(u._id)}>
                        {u.isActive ? '🚫 Deactivate' : '✅ Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <Modal title="Create New User" onClose={() => setModal(false)}>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e => f({ name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={e => f({ email: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Password *</label><input className="form-input" type="password" value={form.password} onChange={e => f({ password: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => f({ phone: e.target.value })} /></div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => f({ role: e.target.value })}>
                <option value="sales">Sales</option>
                <option value="operations">Operations</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳' : '💾 Create User'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
