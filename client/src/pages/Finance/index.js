import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { StatCard, PaymentBar, fmtINR, fmtDate, Spinner } from '../../components/common';

export default function Finance() {
  const [summary,   setSummary]   = useState(null);
  const [customers, setCustomers] = useState([]);
  const [vendors,   setVendors]   = useState([]);
  const [tab,       setTab]       = useState('overview');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, c, v] = await Promise.all([
          api.get('/finance/summary'),
          api.get('/finance/customer-payments'),
          api.get('/finance/vendor-dues'),
        ]);
        setSummary(s.data.data);
        setCustomers(c.data.data);
        setVendors(v.data.data);
      } catch { toast.error('Failed to load finance data'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="loading-screen"><Spinner size={32} /></div>;

  const s = summary || {};

  return (
    <div className="page-enter">
      <div className="stats-grid">
        <StatCard icon="💰" label="Total Revenue"    value={fmtINR(s.totalRevenue)}   color="var(--accent3)" />
        <StatCard icon="✅" label="Collected"         value={fmtINR(s.totalCollected)} color="var(--success)" />
        <StatCard icon="⏳" label="Pending"           value={fmtINR(s.totalPending)}   color="var(--warning)"  changeType="down" />
        <StatCard icon="🏨" label="Vendor Dues"       value={fmtINR(s.totalVendorDues)}color="var(--danger)"   changeType="down" />
        <StatCard icon="📈" label="Net Profit (est.)" value={fmtINR(s.totalCollected - s.totalVendorDues)} color="var(--accent)" />
      </div>

      <div className="tabs">
        {[['overview','📊 Overview'],['customer','👤 Customer Payments'],['vendor','🏨 Vendor Dues']].map(([k,l]) => (
          <button key={k} className={`tab${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid-2">
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>💸 Payment Due Reminders</div>
            {s.paymentDue?.length ? s.paymentDue.map((b, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <strong style={{ fontSize: 13 }}>{b.customer}</strong>
                    <span className="tag" style={{ marginLeft: 6 }}>{b.bookingId}</span>
                  </div>
                  <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 13 }}>{fmtINR(b.pending)}</span>
                </div>
                <PaymentBar paid={b.paid} total={b.totalCost} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span className="text-muted">{b.destination} · {fmtDate(b.startDate)}</span>
                  <span className="text-muted">{b.totalCost > 0 ? (b.paid/b.totalCost*100).toFixed(0) : 0}% paid</span>
                </div>
              </div>
            )) : <p className="text-muted" style={{ textAlign: 'center', padding: 20 }}>✅ All payments collected!</p>}
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>📋 Profit Summary</div>
            {[
              ['Total Revenue (Invoiced)', fmtINR(s.totalRevenue), 'var(--text)'],
              ['Amount Collected',          fmtINR(s.totalCollected), 'var(--success)'],
              ['Pending from Customers',    fmtINR(s.totalPending), 'var(--warning)'],
              ['Vendor Dues Outstanding',   fmtINR(s.totalVendorDues), 'var(--danger)'],
              ['Estimated Net Profit',      fmtINR(s.totalCollected - s.totalVendorDues), 'var(--accent)'],
            ].map(([k, v, c]) => (
              <div key={k} className="profit-row">
                <span>{k}</span>
                <span style={{ color: c, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'customer' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Booking</th><th>Customer</th><th>Total</th><th>Paid</th><th>Pending</th><th>Progress</th></tr></thead>
              <tbody>
                {customers.map((b, i) => (
                  <tr key={i}>
                    <td><strong style={{ color: 'var(--accent)' }}>{b.bookingId}</strong></td>
                    <td><strong>{b.customer?.name}</strong><div className="text-muted">{b.customer?.phone}</div></td>
                    <td>{fmtINR(b.totalCost)}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 700 }}>{fmtINR(b.amountPaid)}</td>
                    <td style={{ color: b.amountPending > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                      {b.amountPending > 0 ? fmtINR(b.amountPending) : '✅ Clear'}
                    </td>
                    <td style={{ minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PaymentBar paid={b.amountPaid} total={b.totalCost} />
                        <span className="text-muted">{b.totalCost > 0 ? (b.amountPaid/b.totalCost*100).toFixed(0) : 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'vendor' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Vendor</th><th>Type</th><th>Total Paid</th><th>Outstanding</th><th>UPI / Bank</th></tr></thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v._id}>
                    <td><strong>{v.name}</strong></td>
                    <td><span className="tag">{v.type}</span></td>
                    <td style={{ color: 'var(--success)', fontWeight: 700 }}>{fmtINR(v.totalPaid)}</td>
                    <td style={{ color: v.outstanding > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                      {v.outstanding > 0 ? fmtINR(v.outstanding) : '✅ Clear'}
                    </td>
                    <td className="text-muted">{v.bankDetails?.upiId || v.bankDetails?.accountNumber || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
