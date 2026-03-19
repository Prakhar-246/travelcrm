import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { StatCard, fmtINR, Spinner } from '../../components/common';

export default function Reports() {
  const [dash,    setDash]    = useState(null);
  const [leads,   setLeads]   = useState(null);
  const [bookings,setBookings]= useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/reports/dashboard'), api.get('/reports/leads'), api.get('/reports/bookings')])
      .then(([d, l, b]) => { setDash(d.data.data); setLeads(l.data.data); setBookings(b.data.data); })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><Spinner size={32} /></div>;

  const maxRev = Math.max(...(bookings?.byDestination?.map(d => d.revenue) || [1]));

  return (
    <div className="page-enter">
      <div className="stats-grid">
        <StatCard icon="📈" label="Conversion Rate"    value={`${dash?.conversionRate || 0}%`}  color="var(--accent)"  />
        <StatCard icon="🧲" label="Total Leads"        value={dash?.totalLeads || 0}              color="var(--accent2)" />
        <StatCard icon="🗓️" label="Total Bookings"    value={dash?.totalBookings || 0}            color="var(--accent3)" />
        <StatCard icon="💰" label="Total Revenue"      value={fmtINR(dash?.revenue)}              color="var(--accent5)" />
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>🧲 Lead Funnel</div>
          {leads?.byStatus?.map((s, i) => {
            const total = leads.byStatus.reduce((x, y) => x + y.count, 0);
            const pct   = total > 0 ? (s.count / total * 100).toFixed(0) : 0;
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{s._id}</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{s.count}</span>
                </div>
                <div className="payment-bar" style={{ height: 8 }}>
                  <div className="payment-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>✈️ Top Destinations</div>
          {bookings?.byDestination?.map((d, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{d._id}</span>
                <span style={{ fontSize: 12, color: 'var(--accent)' }}>{fmtINR(d.revenue)} · {d.count} trips</span>
              </div>
              <div className="payment-bar" style={{ height: 8 }}>
                <div className="payment-fill" style={{ width: `${maxRev > 0 ? (d.revenue/maxRev*100).toFixed(0) : 0}%` }} />
              </div>
            </div>
          ))}
          {!bookings?.byDestination?.length && <p className="text-muted" style={{ textAlign: 'center', padding: 20 }}>No bookings yet</p>}
        </div>
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>📅 Monthly Bookings</div>
        {bookings?.monthly?.length ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
            {bookings.monthly.map((m, i) => {
              const maxC = Math.max(...bookings.monthly.map(x => x.count), 1);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', height: `${(m.count/maxC*60)}px`, minHeight: 4, background: 'linear-gradient(180deg,var(--accent),var(--accent2))', borderRadius: '4px 4px 0 0', opacity: 0.85 }} />
                  <span style={{ fontSize: 9, color: 'var(--text3)' }}>{m._id.month}/{String(m._id.year).slice(-2)}</span>
                </div>
              );
            })}
          </div>
        ) : <p className="text-muted" style={{ textAlign: 'center', padding: 20 }}>No data yet</p>}
      </div>
    </div>
  );
}
