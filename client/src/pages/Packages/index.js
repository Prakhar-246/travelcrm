import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Modal, EmptyState, ConfirmDelete, fmtINR } from '../../components/common';

const EMPTY = { name:'', destinations:[], nights:1, days:2, costPerPerson:'', inclusions:['Hotel','Transport','Meals'], exclusions:['Personal expenses'], highlights:[] };

export default function Packages() {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [selected,setSelected]= useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await api.get('/packages'); setList(data.data); }
    catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openAdd  = () => { setSelected(null); setForm(EMPTY); setModal(true); };
  const openEdit = (p) => { setSelected(p); setForm({ ...p }); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.costPerPerson) return toast.error('Name and cost required');
    setSaving(true);
    try {
      if (selected) { await api.put(`/packages/${selected._id}`, form); toast.success('Updated'); }
      else           { await api.post('/packages', form);                toast.success('Package created'); }
      setModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const f = v => setForm(p => ({ ...p, ...v }));

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>➕ New Package</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
        list.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
            {list.map(p => (
              <div key={p._id} className="card card-sm card-hover">
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{p.name}</div>
                <div style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 8 }}>📍 {p.destinations?.join(' → ')}</div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                  <div><div style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent3)' }}>{p.nights}N/{p.days}D</div><div className="text-muted">Duration</div></div>
                  <div><div style={{ fontWeight: 800, fontSize: 18, color: 'var(--accent5)' }}>{fmtINR(p.costPerPerson)}</div><div className="text-muted">Per Person</div></div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 12 }}>
                  {p.inclusions?.map(i => <span key={i} className="tag">✓ {i}</span>)}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => openEdit(p)}>✏️ Edit</button>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>📋 Use</button>
                  <ConfirmDelete onConfirm={async () => { await api.delete(`/packages/${p._id}`); toast.success('Deleted'); fetch(); }} />
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState icon="📦" message="No packages yet" action={<button className="btn btn-primary btn-sm" onClick={openAdd}>➕ Create Package</button>} />
      )}

      {modal && (
        <Modal title={selected ? 'Edit Package' : 'New Package'} onClose={() => setModal(false)} lg>
          <div className="modal-body">
            <div className="form-group"><label className="form-label">Package Name *</label><input className="form-input" value={form.name} onChange={e => f({ name: e.target.value })} placeholder="e.g. 6N7D Himachal Premium" /></div>
            <div className="form-group"><label className="form-label">Destinations (comma separated)</label><input className="form-input" value={form.destinations?.join(', ')} onChange={e => f({ destinations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Amritsar, Manali, Shimla" /></div>
            <div className="form-grid form-grid-3">
              <div className="form-group"><label className="form-label">Nights</label><input className="form-input" type="number" min={1} value={form.nights} onChange={e => f({ nights: Number(e.target.value) })} /></div>
              <div className="form-group"><label className="form-label">Days</label><input className="form-input" type="number" min={1} value={form.days} onChange={e => f({ days: Number(e.target.value) })} /></div>
              <div className="form-group"><label className="form-label">Cost/Person (₹) *</label><input className="form-input" type="number" value={form.costPerPerson} onChange={e => f({ costPerPerson: e.target.value })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Inclusions (one per line)</label><textarea className="form-textarea" value={form.inclusions?.join('\n')} onChange={e => f({ inclusions: e.target.value.split('\n').filter(Boolean) })} style={{ minHeight: 80 }} /></div>
            <div className="form-group"><label className="form-label">Exclusions (one per line)</label><textarea className="form-textarea" value={form.exclusions?.join('\n')} onChange={e => f({ exclusions: e.target.value.split('\n').filter(Boolean) })} style={{ minHeight: 60 }} /></div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳' : '💾 Save Package'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
