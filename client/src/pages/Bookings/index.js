import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { StatusBadge, Modal, Avatar, EmptyState, ConfirmDelete, PaymentBar, fmtINR, fmtDate } from '../../components/common';

const EMPTY_FORM = {
  'customer.name': '', 'customer.phone': '', 'customer.email': '',
  destination: '', startDate: '', endDate: '', pax: 1, totalCost: '', notes: '', status: 'upcoming',
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);   // detail view
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  // Payment modal
  const [payModal, setPayModal] = useState(false);
  const [payForm,  setPayForm]  = useState({ amount: '', method: 'upi', note: '' });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;
      const { data } = await api.get('/bookings', { params });
      setBookings(data.data);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [filter, search]); // eslint-disable-line

  const openAdd  = () => { setSelected(null); setForm(EMPTY_FORM); setModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        customer: { name: form['customer.name'], phone: form['customer.phone'], email: form['customer.email'] },
        destination: form.destination, startDate: form.startDate, endDate: form.endDate,
        pax: form.pax, totalCost: form.totalCost, notes: form.notes, status: form.status,
      };
      await api.post('/bookings', payload);
      toast.success('Booking created!');
      setModal(false);
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handleAddPayment = async () => {
    if (!payForm.amount) return toast.error('Enter payment amount');
    try {
      await api.post(`/bookings/${selected._id}/payments`, payForm);
      toast.success('Payment recorded');
      setPayModal(false);
      setPayForm({ amount: '', method: 'upi', note: '' });
      const { data } = await api.get(`/bookings/${selected._id}`);
      setSelected(data.data);
      fetchBookings();
    } catch { toast.error('Failed to record payment'); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success('Status updated');
      if (selected?._id === id) {
        const { data } = await api.get(`/bookings/${id}`);
        setSelected(data.data);
      }
      fetchBookings();
    } catch { toast.error('Failed to update status'); }
  };

  const f = v => setForm(p => ({ ...p, ...v }));

  const paidAmt  = b => b.payments?.reduce((s, p) => s + p.amount, 0) || 0;
  const pendAmt  = b => b.totalCost - paidAmt(b);

  if (selected) {
    const paid    = paidAmt(selected);
    const pending = pendAmt(selected);
    return (
      <div className="page-enter">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>← Back</button>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700 }}>{selected.bookingId}</span>
          <StatusBadge status={selected.status} />
        </div>

        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>📋 Booking Details</div>
            {[
              ['Customer',    selected.customer?.name],
              ['Phone',       selected.customer?.phone],
              ['Destination', selected.destination],
              ['PAX',         selected.pax],
              ['Start Date',  fmtDate(selected.startDate)],
              ['End Date',    fmtDate(selected.endDate)],
              ['Total Cost',  fmtINR(selected.totalCost)],
            ].map(([k, v]) => (
              <div key={k} className="profit-row">
                <span className="text-muted">{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>💰 Payment Tracker</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: 18 }}>{fmtINR(paid)}</span>
                <span className="text-muted">{fmtINR(selected.totalCost)} total</span>
              </div>
              <div className="payment-bar" style={{ height: 10 }}>
                <div className="payment-fill" style={{ width: `${Math.min(100,(paid/selected.totalCost*100)).toFixed(0)}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{selected.totalCost > 0 ? (paid/selected.totalCost*100).toFixed(0) : 0}% paid</span>
                <span style={{ fontSize: 12, color: pending > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                  {pending > 0 ? `${fmtINR(pending)} pending` : '✅ Fully paid'}
                </span>
              </div>
            </div>
            <div className="section-title" style={{ marginBottom: 10, fontSize: 12 }}>Payment History</div>
            {selected.payments?.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <div><strong>{fmtINR(p.amount)}</strong> <span className="tag">{p.method}</span></div>
                <span className="text-muted">{fmtDate(p.date)}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => setPayModal(true)}>➕ Record Payment</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>🔄 Update Status</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['upcoming','ongoing','completed','cancelled'].map(s => (
              <button key={s} className={`btn btn-sm ${selected.status === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => handleStatusUpdate(selected._id, s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          {selected.notes && (
            <div style={{ marginTop: 16 }}>
              <div className="form-label">Notes</div>
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--text2)' }}>{selected.notes}</div>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {payModal && (
          <Modal title="Record Payment" onClose={() => setPayModal(false)}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input className="form-input" type="number" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} placeholder="Payment amount" />
              </div>
              <div className="form-group">
                <label className="form-label">Method</label>
                <select className="form-select" value={payForm.method} onChange={e => setPayForm(p => ({ ...p, method: e.target.value }))}>
                  {['cash','upi','bank_transfer','card','cheque'].map(m => <option key={m} value={m}>{m.replace('_',' ').toUpperCase()}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Note</label>
                <input className="form-input" value={payForm.note} onChange={e => setPayForm(p => ({ ...p, note: e.target.value }))} placeholder="Optional note" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setPayModal(false)}>Cancel</button>
              <button className="btn btn-success" onClick={handleAddPayment}>💳 Record Payment</button>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="filter-row">
        <div className="search-bar">
          <span>🔍</span>
          <input placeholder="Search bookings..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['all','upcoming','ongoing','completed','cancelled'].map(s => (
          <button key={s} className={`chip${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>➕ New Booking</button>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Booking ID</th><th>Customer</th><th>Destination</th><th>Pax</th><th>Dates</th><th>Total</th><th>Paid</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {bookings.length ? bookings.map(b => (
                  <tr key={b._id} onClick={() => setSelected(b)} style={{ cursor: 'pointer' }}>
                    <td><strong style={{ color: 'var(--accent)' }}>{b.bookingId}</strong></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={b.customer?.name || '?'} size={28} />
                        <div>
                          <strong>{b.customer?.name}</strong>
                          <div className="text-muted">{b.customer?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>{b.destination}</td>
                    <td>{b.pax}</td>
                    <td className="text-muted">{fmtDate(b.startDate)} → {fmtDate(b.endDate)}</td>
                    <td><strong>{fmtINR(b.totalCost)}</strong></td>
                    <td>
                      <div>
                        <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 700 }}>{fmtINR(paidAmt(b))}</span>
                        <PaymentBar paid={paidAmt(b)} total={b.totalCost} />
                      </div>
                    </td>
                    <td><StatusBadge status={b.status} /></td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelected(b)}>👁 View</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={9}><EmptyState icon="🗓️" message="No bookings yet" /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <Modal title="New Booking" onClose={() => setModal(false)} lg>
          <div className="modal-body">
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <input className="form-input" value={form['customer.name']} onChange={e => f({ 'customer.name': e.target.value })} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input" value={form['customer.phone']} onChange={e => f({ 'customer.phone': e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form['customer.email']} onChange={e => f({ 'customer.email': e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Destination *</label>
                <input className="form-input" value={form.destination} onChange={e => f({ destination: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-input" type="date" value={form.startDate} onChange={e => f({ startDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="form-input" type="date" value={form.endDate} onChange={e => f({ endDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">No. of Pax</label>
                <input className="form-input" type="number" min={1} value={form.pax} onChange={e => f({ pax: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Total Package Cost (₹)</label>
                <input className="form-input" type="number" value={form.totalCost} onChange={e => f({ totalCost: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => f({ notes: e.target.value })} placeholder="Special requirements..." />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳ Saving...' : '💾 Create Booking'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
