import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { EmptyState, fmtDate } from '../../components/common';

const DEFAULT_DAYS = [
  { dayNumber:1, date:'', title:'Arrival & Local Sightseeing', content:'On arrival, check in at hotel and freshen up. Proceed for local sightseeing...\n\nOvernight stay.' },
];

const EMPTY_FORM = { title:'', destinations:[], nights:1, days:2, costPerPerson:0, totalPax:1, inclusions:['Hotel accommodations','All meals as per itinerary','Transportation','Sightseeing'], exclusions:['Personal expenses','Entry tickets','Adventure activities'], dayWise: DEFAULT_DAYS, isTemplate:false, templateName:'' };

export default function Itineraries() {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = list view, object = editor
  const [tab,     setTab]     = useState('builder');
  const [waText,  setWaText]  = useState('');
  const [saving,  setSaving]  = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await api.get('/itineraries'); setList(data.data); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openNew = () => setEditing({ ...EMPTY_FORM });
  const openEdit = (i) => setEditing({ ...i });
  const openTemplate = (t) => {
    const copy = { ...t, _id: undefined, title: t.title + ' (Custom)', isTemplate: false };
    setEditing(copy);
  };

  const handleSave = async () => {
    if (!editing.title) return toast.error('Title required');
    setSaving(true);
    try {
      if (editing._id) { await api.put(`/itineraries/${editing._id}`, editing); toast.success('Saved'); }
      else              { await api.post('/itineraries', editing);               toast.success('Created'); }
      setEditing(null);
      fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this itinerary?')) return;
    await api.delete(`/itineraries/${id}`);
    toast.success('Deleted'); fetch();
  };

  const handleDuplicate = async (id) => {
    try { await api.post(`/itineraries/${id}/duplicate`); toast.success('Duplicated'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const loadWhatsApp = async (id) => {
    try {
      const { data } = await api.get(`/itineraries/${id}/whatsapp`);
      setWaText(data.data.text);
      setTab('whatsapp');
    } catch { toast.error('Failed'); }
  };

  const updateDay = (idx, field, val) => {
    const days = [...editing.dayWise];
    days[idx] = { ...days[idx], [field]: val };
    setEditing(e => ({ ...e, dayWise: days }));
  };

  const addDay = () => {
    const days = [...editing.dayWise, { dayNumber: editing.dayWise.length + 1, date: '', title: 'New Day', content: '' }];
    setEditing(e => ({ ...e, dayWise: days, days: days.length, nights: days.length - 1 }));
  };

  const removeDay = (idx) => {
    const days = editing.dayWise.filter((_, i) => i !== idx).map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setEditing(e => ({ ...e, dayWise: days, days: days.length, nights: Math.max(1, days.length - 1) }));
  };

  const e = (v) => setEditing(p => ({ ...p, ...v }));
  const totalCost = (editing?.costPerPerson || 0) * (editing?.totalPax || 1);

  /* ── LIST VIEW ── */
  if (!editing) {
    return (
      <div className="page-enter">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="filter-row" style={{ margin: 0 }}>
            <span className="section-title">All Itineraries</span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={openNew}>➕ New Itinerary</button>
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
          list.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
              {list.map(i => (
                <div key={i._id} className="card card-sm card-hover">
                  {i.isTemplate && <span className="tag" style={{ marginBottom: 8, color: 'var(--accent5)', borderColor: 'var(--accent5)44' }}>📦 Template</span>}
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{i.title}</div>
                  <div className="text-muted">{i.destinations?.join(' → ')}</div>
                  <div style={{ display: 'flex', gap: 14, margin: '10px 0' }}>
                    <div><div style={{ fontWeight: 800, color: 'var(--accent3)' }}>{i.nights}N/{i.days}D</div><div className="text-muted">Duration</div></div>
                    <div><div style={{ fontWeight: 800, color: 'var(--accent5)' }}>₹{Number(i.costPerPerson).toLocaleString('en-IN')}</div><div className="text-muted">Per Person</div></div>
                    <div><div style={{ fontWeight: 800, color: 'var(--text2)' }}>{i.totalPax}</div><div className="text-muted">PAX</div></div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => openEdit(i)}>✏️ Edit</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDuplicate(i._id)}>📋</button>
                    <button className="btn btn-success btn-sm" onClick={() => { setEditing(i); setTab('whatsapp'); loadWhatsApp(i._id); }}>💬</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(i._id)}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState icon="🗺️" message="No itineraries yet. Build your first one!" action={<button className="btn btn-primary btn-sm" onClick={openNew}>➕ New Itinerary</button>} />
        )}
      </div>
    );
  }

  /* ── EDITOR VIEW ── */
  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>← Back</button>
        <span style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, flex: 1 }}>
          {editing._id ? `Edit: ${editing.title}` : 'New Itinerary'}
        </span>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save'}</button>
      </div>

      <div className="tabs">
        {[['builder','🛠 Builder'],['preview','📄 Preview'],['whatsapp','💬 WhatsApp']].map(([k,l]) => (
          <button key={k} className={`tab${tab === k ? ' active' : ''}`} onClick={() => { setTab(k); if (k === 'whatsapp' && editing._id) loadWhatsApp(editing._id); }}>{l}</button>
        ))}
      </div>

      {tab === 'builder' && (
        <>
          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div className="card card-sm">
              <div className="section-title" style={{ marginBottom: 14 }}>Package Info</div>
              <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={editing.title} onChange={ev => e({ title: ev.target.value })} placeholder="e.g. 6N7D Himachal Premium" /></div>
              <div className="form-group"><label className="form-label">Destinations (comma sep.)</label><input className="form-input" value={editing.destinations?.join(', ')} onChange={ev => e({ destinations: ev.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Manali, Kasol, Shimla" /></div>
              <div className="form-grid form-grid-2">
                <div className="form-group"><label className="form-label">Cost/Person (₹)</label><input className="form-input" type="number" value={editing.costPerPerson} onChange={ev => e({ costPerPerson: Number(ev.target.value) })} /></div>
                <div className="form-group"><label className="form-label">Total PAX</label><input className="form-input" type="number" value={editing.totalPax} onChange={ev => e({ totalPax: Number(ev.target.value) })} /></div>
              </div>
              <div style={{ background: 'rgba(79,140,255,.08)', border: '1px solid rgba(79,140,255,.2)', borderRadius: 8, padding: '10px 14px' }}>
                <div className="text-muted">Total Package Cost</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-head)' }}>₹{totalCost.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="card card-sm">
              <div className="section-title" style={{ marginBottom: 14 }}>Inclusions & Exclusions</div>
              <div className="form-group">
                <label className="form-label">✅ Inclusions (one per line)</label>
                <textarea className="form-textarea" style={{ minHeight: 90 }} value={editing.inclusions?.join('\n')} onChange={ev => e({ inclusions: ev.target.value.split('\n').filter(Boolean) })} />
              </div>
              <div className="form-group">
                <label className="form-label">❌ Exclusions (one per line)</label>
                <textarea className="form-textarea" style={{ minHeight: 70 }} value={editing.exclusions?.join('\n')} onChange={ev => e({ exclusions: ev.target.value.split('\n').filter(Boolean) })} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={editing.isTemplate} onChange={ev => e({ isTemplate: ev.target.checked })} />
                Save as reusable template
              </label>
            </div>
          </div>

          <div className="section-header">
            <span className="section-title">📅 Day-wise Itinerary ({editing.dayWise?.length} Days)</span>
            <button className="btn btn-primary btn-sm" onClick={addDay}>➕ Add Day</button>
          </div>

          {editing.dayWise?.map((d, i) => (
            <div key={i} className="day-card">
              <div className="day-header">
                <span className="day-num">DAY {d.dayNumber}</span>
                <input className="form-input" style={{ flex: 1, background: 'transparent', border: 'none', fontWeight: 700, fontSize: 13, color: 'var(--text)' }} value={d.date} onChange={ev => updateDay(i, 'date', ev.target.value)} placeholder="Date (e.g. 15 April)" />
                <button className="btn btn-danger btn-sm" onClick={() => removeDay(i)}>✕</button>
              </div>
              <div className="day-body">
                <div className="form-group">
                  <label className="form-label">Day Title</label>
                  <input className="form-input" value={d.title} onChange={ev => updateDay(i, 'title', ev.target.value)} placeholder="e.g. Arrival in Manali | Local Sightseeing" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" style={{ minHeight: 80 }} value={d.content} onChange={ev => updateDay(i, 'content', ev.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === 'preview' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span className="section-title">PDF Preview</span>
            <button className="btn btn-primary btn-sm">⬇️ Download PDF</button>
          </div>
          <div style={{ padding: 20, background: '#f0f2f8' }}>
            <div style={{ background: '#fff', color: '#111', borderRadius: 8, padding: '28px 32px', maxWidth: 700, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #4f8cff', paddingBottom: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#4f8cff' }}>TravelandHolidays.in</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{editing.title}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#f0f4ff', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
                <div><strong>Duration:</strong> {editing.nights}N / {editing.days}D</div>
                <div><strong>PAX:</strong> {editing.totalPax}</div>
                <div><strong>Cost/Person:</strong> ₹{Number(editing.costPerPerson).toLocaleString('en-IN')}</div>
                <div><strong>Total Cost:</strong> ₹{totalCost.toLocaleString('en-IN')}</div>
              </div>
              {editing.dayWise?.map((d, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ background: '#4f8cff', color: '#fff', padding: '4px 12px', borderRadius: 4, fontSize: 12, fontWeight: 700, marginBottom: 6, display: 'inline-block' }}>
                    Day {d.dayNumber}{d.date ? ` — ${d.date}` : ''} | {d.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#444', lineHeight: 1.6 }}>{d.content}</div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #ddd', paddingTop: 10, marginTop: 16, fontSize: 11, color: '#777', textAlign: 'center' }}>
                TravelandHolidays.in | +91-7000739379 | sales.travelandholidays@gmail.com
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'whatsapp' && (
        <div className="card">
          <div className="section-header">
            <span className="section-title">💬 WhatsApp Format</span>
            <button className="btn btn-success btn-sm" onClick={() => { navigator.clipboard?.writeText(waText); toast.success('Copied!'); }}>📋 Copy</button>
          </div>
          {waText ? (
            <div className="whatsapp-preview">{waText}</div>
          ) : (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text3)' }}>
              {editing._id ? '⏳ Loading...' : '💾 Save the itinerary first to generate WhatsApp format'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
