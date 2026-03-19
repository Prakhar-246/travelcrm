import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { StatusBadge, Modal, EmptyState, ConfirmDelete, fmtINR } from '../../components/common';

const EMPTY = { vendorName:'', vehicleType:'', vehicleNumber:'', seatingCapacity:'', ratePerDay:'', ratePerKm:'', 'driver.name':'', 'driver.phone':'', 'driver.license':'', notes:'' };

export default function Transport() {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [modal,   setModal]   = useState(false);
  const [selected,setSelected]= useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      const { data } = await api.get('/transport', { params });
      setList(data.data);
    } catch { toast.error('Failed to load transport'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter]); // eslint-disable-line

  const openAdd  = () => { setSelected(null); setForm(EMPTY); setModal(true); };
  const openEdit = (t) => { setSelected(t); setForm({ ...EMPTY, ...t, 'driver.name': t.driver?.name || '', 'driver.phone': t.driver?.phone || '', 'driver.license': t.driver?.license || '' }); setModal(true); };

  const handleSave = async () => {
    if (!form.vendorName || !form.vehicleType || !form.ratePerDay) return toast.error('Fill required fields');
    setSaving(true);
    try {
      const payload = { ...form, driver: { name: form['driver.name'], phone: form['driver.phone'], license: form['driver.license'] } };
      if (selected) { await api.put(`/transport/${selected._id}`, payload); toast.success('Updated'); }
      else           { await api.post('/transport', payload);                toast.success('Vehicle added'); }
      setModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const f = v => setForm(p => ({ ...p, ...v }));

  return (
    <div className="page-enter">
      <div className="filter-row">
        {['all','available','assigned','maintenance'].map(s => (
          <button key={s} className={`chip${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>➕ Add Vehicle</button>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Vendor</th><th>Vehicle</th><th>Capacity</th><th>Rate/Day</th><th>Rate/KM</th><th>Driver</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {list.length ? list.map(t => (
                  <tr key={t._id}>
                    <td><strong>{t.vendorName}</strong></td>
                    <td>{t.vehicleType} {t.vehicleNumber && <span className="tag">{t.vehicleNumber}</span>}</td>
                    <td>{t.seatingCapacity ? `${t.seatingCapacity} seats` : '—'}</td>
                    <td><strong style={{ color: 'var(--accent)' }}>{fmtINR(t.ratePerDay)}</strong></td>
                    <td>{t.ratePerKm ? `₹${t.ratePerKm}/km` : '—'}</td>
                    <td><div className="text-muted">{t.driver?.name}<br />{t.driver?.phone}</div></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>✏️</button>
                        <ConfirmDelete onConfirm={async () => { await api.delete(`/transport/${t._id}`); toast.success('Removed'); fetch(); }} />
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan={8}><EmptyState icon="🚕" message="No vehicles added yet" /></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <Modal title={selected ? 'Edit Vehicle' : 'Add Vehicle'} onClose={() => setModal(false)} lg>
          <div className="modal-body">
            <div className="form-grid form-grid-2">
              <div className="form-group"><label className="form-label">Vendor Name *</label><input className="form-input" value={form.vendorName} onChange={e => f({ vendorName: e.target.value })} placeholder="e.g. Himachal Travels" /></div>
              <div className="form-group"><label className="form-label">Vehicle Type *</label><input className="form-input" value={form.vehicleType} onChange={e => f({ vehicleType: e.target.value })} placeholder="e.g. Tempo Traveller 17 Seat" /></div>
              <div className="form-group"><label className="form-label">Vehicle Number</label><input className="form-input" value={form.vehicleNumber} onChange={e => f({ vehicleNumber: e.target.value })} placeholder="HP-01-AB-1234" /></div>
              <div className="form-group"><label className="form-label">Seating Capacity</label><input className="form-input" type="number" value={form.seatingCapacity} onChange={e => f({ seatingCapacity: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Rate Per Day (₹) *</label><input className="form-input" type="number" value={form.ratePerDay} onChange={e => f({ ratePerDay: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Rate Per KM (₹)</label><input className="form-input" type="number" value={form.ratePerKm} onChange={e => f({ ratePerKm: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Driver Name</label><input className="form-input" value={form['driver.name']} onChange={e => f({ 'driver.name': e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Driver Phone</label><input className="form-input" value={form['driver.phone']} onChange={e => f({ 'driver.phone': e.target.value })} /></div>
              <div className="form-group"><label className="form-label">License No.</label><input className="form-input" value={form['driver.license']} onChange={e => f({ 'driver.license': e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Notes</label><input className="form-input" value={form.notes} onChange={e => f({ notes: e.target.value })} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳' : '💾 Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
