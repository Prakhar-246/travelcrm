import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { StatCard, StatusBadge, fmtINR, fmtDate, Spinner, Avatar, PaymentBar } from '../../components/common';

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><Spinner size={32} /><p>Loading dashboard...</p></div>;

  const s = stats || {};

  const leads    = s.recentLeads    || [];
  const bookings = s.recentBookings || [];

  return (
    <div className="page-enter">

      {/* ── Stats Row ── */}
      <div className="stats-grid">
        <StatCard icon="🧲" label="Total Leads"     value={s.totalLeads    || 0} change="All time"     color="var(--accent)"  />
        <StatCard icon="🔥" label="New Leads"       value={s.newLeads      || 0} change="Need contact" color="var(--danger)"  changeType="down" />
        <StatCard icon="🗓️" label="Total Bookings"  value={s.totalBookings || 0} change="All bookings" color="var(--accent2)" />
        <StatCard icon="✈️" label="Upcoming Trips"  value={s.upcomingBookings || 0} change="Next 30 days" color="var(--info)" />
        <StatCard icon="💰" label="Revenue"         value={fmtINR(s.revenue)} change="Total invoiced"  color="var(--accent3)" />
        <StatCard icon="⏳" label="Pending Payment" value={fmtINR(s.pending)} change="To collect"      color="var(--accent5)" changeType="down" />
      </div>

      {/* ── Recent Leads + Recent Bookings ── */}
      <div className="grid-2" style={{ marginBottom: 20 }}>

        {/* Recent Leads */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <span className="section-title">🧲 Recent Leads</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>View All →</button>
          </div>

          {leads.length ? (
            leads.map((l, i) => (
              <div
                key={l._id || i}
                onClick={() => navigate('/leads')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 20px',
                  borderBottom: i < leads.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer', transition: 'background .12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Avatar name={l.name} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>📍 {l.destination}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <StatusBadge status={l.status} />
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{fmtDate(l.createdAt)}</div>
                </div>
              </div>
            ))
          ) : (
            /* Empty state with CTA */
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🧲</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>No leads yet. Add your first lead!</div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/leads')}>➕ Add Lead</button>
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <span className="section-title">🗓️ Recent Bookings</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/bookings')}>View All →</button>
          </div>

          {bookings.length ? (
            bookings.map((b, i) => {
              const paid    = b.payments?.reduce((s, p) => s + p.amount, 0) || 0;
              const total   = b.totalCost || 0;
              const pending = total - paid;
              return (
                <div
                  key={b._id || i}
                  onClick={() => navigate('/bookings')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px',
                    borderBottom: i < bookings.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer', transition: 'background .12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Avatar name={b.customer?.name || '?'} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.customer?.name}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, background: 'rgba(79,140,255,.12)', padding: '1px 6px', borderRadius: 4, flexShrink: 0 }}>
                        {b.bookingId}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>📍 {b.destination}</div>
                    {/* Mini payment bar */}
                    <div style={{ marginTop: 5 }}>
                      <PaymentBar paid={paid} total={total} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent3)' }}>{fmtINR(total)}</div>
                    <div style={{ fontSize: 11, color: pending > 0 ? 'var(--danger)' : 'var(--success)', marginTop: 2, fontWeight: 600 }}>
                      {pending > 0 ? `${fmtINR(pending)} due` : '✅ Paid'}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty state with CTA */
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🗓️</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>No bookings yet. Create your first booking!</div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/bookings')}>➕ New Booking</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 16 }}>⚡ Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
          {[
            { icon: '🧲', label: 'Add Lead',        path: '/leads'       },
            { icon: '🗓️', label: 'New Booking',     path: '/bookings'    },
            { icon: '🗺️', label: 'Build Itinerary', path: '/itineraries' },
            { icon: '🏨', label: 'Add Hotel',        path: '/hotels'      },
            { icon: '💰', label: 'Finance',          path: '/finance'     },
            { icon: '📊', label: 'Reports',          path: '/reports'     },
          ].map(a => (
            <button key={a.path} className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '12px 14px' }} onClick={() => navigate(a.path)}>
              <span style={{ fontSize: 18 }}>{a.icon}</span> {a.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}