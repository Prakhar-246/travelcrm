import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { StatusBadge, Modal, Avatar, EmptyState, ConfirmDelete, fmtINR, fmtDate } from '../../components/common';

const EMPTY_FORM = { name: '', phone: '', email: '', destination: '', budget: '', travelDates: '', pax: 1, status: 'new', source: 'WhatsApp', notes: [] };
const STATUSES   = ['all','new','contacted','proposal','negotiation','booked','lost'];
const SOURCES    = ['WhatsApp','Website','Instagram','Facebook','Referral','Direct','Other'];

export default function Leads() {
  const [leads,    setLeads]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [view,     setView]     = useState('table'); // table | pipeline
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(false);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [noteText, setNoteText] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;
      const { data } = await api.get('/leads', { params });
      setLeads(data.data);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, [filter, search]); // eslint-disable-line

  const openAdd = () => { setSelected(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (l) => { setSelected(l); setForm({ ...l }); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.destination || !form.budget) {
      return toast.error('Please fill required fields');
    }
    setSaving(true);
    try {
      if (selected) {
        await api.put(`/leads/${selected._id}`, form);
        toast.success('Lead updated');
      } else {
        await api.post('/leads', form);
        toast.success('Lead created');
      }
      setModal(false);
      fetchLeads();
    } catch (err) { toast.error(err.response?.data?.error || 'Error saving lead'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted');
      fetchLeads();
    } catch { toast.error('Failed to delete'); }
  };

  const addNote = async () => {
    if (!noteText.trim() || !selected) return;
    try {
      const { data } = await api.post(`/leads/${selected._id}/notes`, { text: noteText });
      setSelected(data.data);
      setNoteText('');
      toast.success('Note added');
    } catch { toast.error('Failed to add note'); }
  };

  const pipelineCols = STATUSES.filter(s => s !== 'all');

  const f = (v) => setForm(p => ({ ...p, ...v }));

  return (
    <div className="page-enter">
      {/* Filter row */}
      <div className="filter-row">
        <div className="search-bar">
          <span>🔍</span>
          <input placeholder="Search name, phone, destination..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {STATUSES.map(s => (
          <button key={s} className={`chip${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            <strong>{s === 'all' ? leads.length : leads.filter(l => l.status === s).length}</strong>
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className={`btn btn-ghost btn-sm${view === 'table' ? ' btn-primary' : ''}`} onClick={() => setView('table')}>☰ Table</button>
          <button className={`btn btn-ghost btn-sm${view === 'pipeline' ? ' btn-primary' : ''}`} onClick={() => setView('pipeline')}>🗂 Pipeline</button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>➕ Add Lead</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : view === 'table' ? (
        /* Table View */
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Customer</th><th>Destination</th><th>Budget</th><th>Pax</th><th>Dates</th><th>Source</th><th>Status</th><th>Created</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {leads.length ? leads.map(l => (
                  <tr key={l._id} onClick={() => openEdit(l)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={l.name} size={30} />
                        <div>
                          <strong>{l.name}</strong>
                          <div className="text-muted">{l.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td><strong>{l.destination}</strong></td>
                    <td><strong style={{ color: 'var(--accent)' }}>{fmtINR(l.budget)}</strong></td>
                    <td>{l.pax} pax</td>
                    <td className="text-muted">{l.travelDates || '—'}</td>
                    <td><span className="tag">{l.source}</span></td>
                    <td><StatusBadge status={l.status} /></td>
                    <td className="text-muted">{fmtDate(l.createdAt)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(l)}>✏️</button>
                        <ConfirmDelete onConfirm={() => handleDelete(l._id)} />
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={9}><EmptyState icon="🧲" message="No leads found. Add your first lead!" /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Pipeline View */
        <div className="pipeline-wrap">
          {pipelineCols.map(col => (
            <div key={col} className="pipeline-col">
              <div className="pipeline-col-header">
                <span className="pipeline-col-title">{col}</span>
                <span className="nav-badge">{leads.filter(l => l.status === col).length}</span>
              </div>
              {leads.filter(l => l.status === col).map(l => (
                <div key={l._id} className="pipeline-card" onClick={() => openEdit(l)}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{l.name}</div>
                  <div className="text-muted">{l.destination}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>{fmtINR(l.budget)}</span>
                    <span className="text-muted">{l.pax} pax</span>
                  </div>
                  <div className="text-muted" style={{ marginTop: 4 }}>{l.travelDates}</div>
                </div>
              ))}
              {!leads.filter(l => l.status === col).length && (
                <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, padding: '12px 0' }}>No leads</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <Modal title={selected ? `Edit Lead — ${selected.name}` : 'New Lead'} onClose={() => setModal(false)} lg>
          <div className="modal-body">
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.name} onChange={e => f({ name: e.target.value })} placeholder="Customer name" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input" value={form.phone} onChange={e => f({ phone: e.target.value })} placeholder="Mobile number" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => f({ email: e.target.value })} placeholder="Email address" />
              </div>
              <div className="form-group">
                <label className="form-label">Destination *</label>
                <input className="form-input" value={form.destination} onChange={e => f({ destination: e.target.value })} placeholder="e.g. Himachal Pradesh" />
              </div>
              <div className="form-group">
                <label className="form-label">Budget (₹) *</label>
                <input className="form-input" type="number" value={form.budget} onChange={e => f({ budget: e.target.value })} placeholder="Total budget" />
              </div>
              <div className="form-group">
                <label className="form-label">Travel Dates</label>
                <input className="form-input" value={form.travelDates} onChange={e => f({ travelDates: e.target.value })} placeholder="e.g. Apr 15–22" />
              </div>
              <div className="form-group">
                <label className="form-label">No. of Pax</label>
                <input className="form-input" type="number" min={1} value={form.pax} onChange={e => f({ pax: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Source</label>
                <select className="form-select" value={form.source} onChange={e => f({ source: e.target.value })}>
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => f({ status: e.target.value })}>
                  {STATUSES.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              {form.status === 'lost' && (
                <div className="form-group">
                  <label className="form-label">Lost Reason</label>
                  <input className="form-input" value={form.lostReason || ''} onChange={e => f({ lostReason: e.target.value })} placeholder="Why was this lead lost?" />
                </div>
              )}
            </div>

            {/* Notes section when editing */}
            {selected && (
              <>
                <hr className="divider" />
                <div className="section-title" style={{ marginBottom: 12 }}>📝 Notes</div>
                {selected.notes?.map((n, i) => (
                  <div key={i} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 12px', marginBottom: 8, fontSize: 13 }}>
                    <div style={{ color: 'var(--text)' }}>{n.text}</div>
                    <div className="text-muted">{fmtDate(n.addedAt)}</div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input className="form-input" placeholder="Add a note..." value={noteText} onChange={e => setNoteText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote()} />
                  <button className="btn btn-ghost" onClick={addNote}>Add</button>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? '⏳ Saving...' : '💾 Save Lead'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
