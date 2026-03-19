import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Modal, Stars, EmptyState, ConfirmDelete, fmtINR, fmtDate } from '../../components/common';

const EMPTY = { name:'', type:'Hotel', contactPerson:'', phone:'', email:'', address:'', rating:3, notes:'', 'bankDetails.accountName':'', 'bankDetails.accountNumber':'', 'bankDetails.ifscCode':'', 'bankDetails.bankName':'', 'bankDetails.upiId':'' };
const TYPES  = ['Hotel','Transport','Activity','Catering','Guide','Other'];

export default function Vendors() {
  const [vendors,  setVendors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [typeFilter, setType]   = useState('all');
  const [modal,    setModal]    = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [payForm,  setPayForm]  = useState({ amount:'', method:'upi', bookingRef:'', note:'' });
  const [saving,   setSaving]   = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const params = typeFilter !== 'all' ? { type: typeFilter } : {};
      const { data } = await api.get('/vendors', { params });
      setVendors(data.data);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [typeFilter]); // eslint-disable-line

  const openAdd  = () => { setSelected(null); setForm(EMPTY); setModal(true); };
  const openEdit = (v) => { setSelected(v); setForm({ ...EMPTY, ...v, 'bankDetails.accountName': v.bankDetails?.accountName||'', 'bankDetails.accountNumber': v.bankDetails?.accountNumber||'', 'bankDetails.ifscCode': v.bankDetails?.ifscCode||'', 'bankDetails.bankName': v.bankDetails?.bankName||'', 'bankDetails.upiId': v.bankDetails?.upiId||'' }); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.type) return toast.error('Name and type required');
    setSaving(true);
    try {
      const payload = { ...form, bankDetails: { accountName: form['bankDetails.accountName'], accountNumber: form['bankDetails.accountNumber'], ifscCode: form['bankDetails.ifscCode'], bankName: form['bankDetails.bankName'], upiId: form['bankDetails.upiId'] } };
      if (selected) { await api.put(`/vendors/${selected._id}`, payload); toast.success('Updated'); }
      else           { await api.post('/vendors', payload);                toast.success('Vendor added'); }
      setModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handlePayment = async () => {
    if (!payForm.amount) return toast.error('Enter amount');
    try {
      await api.post(`/vendors/${selected._id}/payments`, payForm);
      toast.success('Payment recorded');
      setPayModal(false);
      fetch();
    } catch { toast.error('Failed'); }
  };

  const f = v => setForm(p => ({ ...p, ...v }));

  return (
    <div className="page-enter">
      <div className="filter-row">
        {['all', ...TYPES].map(t => (
          <button key={t} className={`chip${typeFilter === t ? ' active' : ''}`} onClick={() => setType(t)}>{t}</button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>➕ Add Vendor</button>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
        vendors.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 14 }}>
            {vendors.map(v => (
              <div key={v._id} className="card card-sm card-hover">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{v.name}</div>
                    <span className="tag">{v.type}</span>
                  </div>
                  <Stars n={v.rating} />
                </div>
                {v.phone && <div className="text-muted">📞 {v.contactPerson} · {v.phone}</div>}
                {v.email && <div className="text-muted">✉️ {v.email}</div>}
                <hr className="divider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <div>
                    <div style={{ color: 'var(--success)', fontWeight: 700 }}>{fmtINR(v.totalPaid)}</div>
                    <div className="text-muted">Paid</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: v.outstanding > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                      {v.outstanding > 0 ? fmtINR(v.outstanding) : '✅ Clear'}
                    </div>
                    <div className="text-muted">Dues</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => openEdit(v)}>✏️ Edit</button>
                  {v.outstanding > 0 && (
                    <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => { setSelected(v); setPayModal(true); }}>💳 Pay</button>
                  )}
                  <ConfirmDelete onConfirm={async () => { await api.delete(`/vendors/${v._id}`); toast.success('Removed'); fetch(); }} />
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState icon="🤝" message="No vendors yet" action={<button className="btn btn-primary btn-sm" onClick={openAdd}>➕ Add Vendor</button>} />
      )}

      {modal && (
        <Modal title={selected ? 'Edit Vendor' : 'Add Vendor'} onClose={() => setModal(false)} lg>
          <div className="modal-body">
            <div className="form-grid form-grid-2">
              <div className="form-group"><label className="form-label">Vendor Name *</label><input className="form-input" value={form.name} onChange={e => f({ name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Type *</label><select className="form-select" value={form.type} onChange={e => f({ type: e.target.value })}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Contact Person</label><input className="form-input" value={form.contactPerson} onChange={e => f({ contactPerson: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => f({ phone: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={e => f({ email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Rating</label><select className="form-select" value={form.rating} onChange={e => f({ rating: Number(e.target.value) })}>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}</select></div>
            </div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 12, fontWeight: 700, marginBottom: 10, color: 'var(--text3)', letterSpacing: 0.5 }}>BANK DETAILS</div>
            <div className="form-grid form-grid-2">
              {[['Account Name','accountName'],['Account Number','accountNumber'],['IFSC Code','ifscCode'],['Bank Name','bankName'],['UPI ID','upiId']].map(([lbl, key]) => (
                <div key={key} className="form-group"><label className="form-label">{lbl}</label><input className="form-input" value={form[`bankDetails.${key}`]} onChange={e => f({ [`bankDetails.${key}`]: e.target.value })} /></div>
              ))}
            </div>
            <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={e => f({ notes: e.target.value })} /></div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳' : '💾 Save'}</button>
          </div>
        </Modal>
      )}

      {payModal && selected && (
        <Modal title={`Pay — ${selected.name}`} onClose={() => setPayModal(false)}>
          <div className="modal-body">
            <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Outstanding Due</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--danger)' }}>{fmtINR(selected.outstanding)}</div>
            </div>
            <div className="form-group"><label className="form-label">Amount (₹)</label><input className="form-input" type="number" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Method</label><select className="form-select" value={payForm.method} onChange={e => setPayForm(p => ({ ...p, method: e.target.value }))}>{['cash','upi','bank_transfer','card','cheque'].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Booking Reference</label><input className="form-input" value={payForm.bookingRef} onChange={e => setPayForm(p => ({ ...p, bookingRef: e.target.value }))} placeholder="e.g. B2026-001" /></div>
            <div className="form-group"><label className="form-label">Note</label><input className="form-input" value={payForm.note} onChange={e => setPayForm(p => ({ ...p, note: e.target.value }))} /></div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setPayModal(false)}>Cancel</button>
            <button className="btn btn-success" onClick={handlePayment}>💳 Record Payment</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
