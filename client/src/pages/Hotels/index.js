import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Modal, Stars, EmptyState, ConfirmDelete, fmtINR } from '../../components/common';

const EMPTY = { name:'', location:'', city:'', state:'', category:'3 Star', starRating:3, cpRate:'', mapRate:'', apRate:'', peakRate:'', mealPlans:[], roomTypes:[], contactPerson:{ name:'', phone:'', email:'' }, notes:'' };
const CATEGORIES = ['Budget','1 Star','2 Star','3 Star','4 Star','5 Star'];
const MEAL_PLANS = ['EP','CP','MAP','AP'];

export default function Hotels() {
  const [hotels,  setHotels]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);
  const [selected,setSelected]= useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/hotels', { params: search ? { search } : {} });
      setHotels(data.data);
    } catch { toast.error('Failed to load hotels'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [search]); // eslint-disable-line

  const openAdd  = () => { setSelected(null); setForm(EMPTY); setModal(true); };
  const openEdit = (h) => { setSelected(h); setForm({ ...EMPTY, ...h }); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.location) return toast.error('Name and location required');
    setSaving(true);
    try {
      if (selected) { await api.put(`/hotels/${selected._id}`, form); toast.success('Hotel updated'); }
      else           { await api.post('/hotels', form);               toast.success('Hotel added'); }
      setModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/hotels/${id}`); toast.success('Hotel removed'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const f = v => setForm(p => ({ ...p, ...v }));

  return (
    <div className="page-enter">
      <div className="filter-row">
        <div className="search-bar">
          <span>🔍</span>
          <input placeholder="Search hotels by name, city..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>➕ Add Hotel</button>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
        hotels.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
            {hotels.map(h => (
              <div key={h._id} className="card card-sm card-hover" style={{ cursor: 'pointer' }} onClick={() => openEdit(h)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{h.name}</div>
                    <div className="text-muted">📍 {h.location}{h.city ? `, ${h.city}` : ''}</div>
                  </div>
                  <span className="tag">{h.category}</span>
                </div>
                <Stars n={h.starRating} />
                <hr className="divider" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
                  {[['CP', h.cpRate], ['MAP', h.mapRate], ['Peak', h.peakRate]].map(([l, v]) => (
                    <div key={l} style={{ background: 'var(--surface)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{l}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{v ? fmtINR(v) : '—'}</div>
                    </div>
                  ))}
                </div>
                {h.contactPerson?.phone && <div className="text-muted">📞 {h.contactPerson.name} · {h.contactPerson.phone}</div>}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                  {h.roomTypes?.map(r => <span key={r} className="tag">{r}</span>)}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => openEdit(h)}>✏️ Edit</button>
                  <ConfirmDelete onConfirm={() => handleDelete(h._id)} />
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState icon="🏨" message="No hotels yet. Add your first hotel!" action={<button className="btn btn-primary btn-sm" onClick={openAdd}>➕ Add Hotel</button>} />
      )}

      {modal && (
        <Modal title={selected ? 'Edit Hotel' : 'Add Hotel'} onClose={() => setModal(false)} lg>
          <div className="modal-body">
            <div className="form-grid form-grid-2">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Hotel Name *</label>
                <input className="form-input" value={form.name} onChange={e => f({ name: e.target.value })} placeholder="e.g. Hotel Rosewood - Mall Road" />
              </div>
              <div className="form-group">
                <label className="form-label">Location / Area *</label>
                <input className="form-input" value={form.location} onChange={e => f({ location: e.target.value })} placeholder="e.g. Mall Road, Manali" />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={form.city} onChange={e => f({ city: e.target.value })} placeholder="Manali" />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-input" value={form.state} onChange={e => f({ state: e.target.value })} placeholder="Himachal Pradesh" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => f({ category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Star Rating</label>
                <select className="form-select" value={form.starRating} onChange={e => f({ starRating: Number(e.target.value) })}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Room Types (comma separated)</label>
                <input className="form-input" value={form.roomTypes?.join(', ')} onChange={e => f({ roomTypes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Standard, Deluxe, Suite" />
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--text2)', letterSpacing: 0.5 }}>RATES (₹ PER NIGHT)</div>
            <div className="form-grid form-grid-3">
              {[['CP Rate (Breakfast)', 'cpRate'], ['MAP Rate (B+D)', 'mapRate'], ['AP Rate (All Meals)', 'apRate'], ['EP Rate (No Meals)', 'epRate'], ['Peak Season Rate', 'peakRate']].map(([lbl, key]) => (
                <div key={key} className="form-group">
                  <label className="form-label">{lbl}</label>
                  <input className="form-input" type="number" value={form[key] || ''} onChange={e => f({ [key]: e.target.value })} placeholder="0" />
                </div>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--text2)', letterSpacing: 0.5, marginTop: 4 }}>CONTACT PERSON</div>
            <div className="form-grid form-grid-3">
              {[['Name', 'name'], ['Phone', 'phone'], ['Email', 'email']].map(([lbl, key]) => (
                <div key={key} className="form-group">
                  <label className="form-label">{lbl}</label>
                  <input className="form-input" value={form.contactPerson?.[key] || ''} onChange={e => f({ contactPerson: { ...form.contactPerson, [key]: e.target.value } })} placeholder={lbl} />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => f({ notes: e.target.value })} placeholder="Contract terms, special conditions..." />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save Hotel'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
