import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common';

const NAV = [
  { section: 'OVERVIEW',    items: [{ path: '/',           label: 'Dashboard',      icon: '🏠' }] },
  { section: 'SALES',       items: [
    { path: '/leads',        label: 'Lead Management',  icon: '🧲', badgeKey: 'newLeads', badgeColor: 'red' },
    { path: '/packages',     label: 'Packages',         icon: '📦' },
    { path: '/itineraries',  label: 'Itinerary Builder',icon: '🗺️' },
  ]},
  { section: 'OPERATIONS',  items: [
    { path: '/bookings',     label: 'Bookings',         icon: '🗓️', badgeKey: 'upcomingBookings', badgeColor: 'green' },
    { path: '/hotels',       label: 'Hotel Supply',     icon: '🏨' },
    { path: '/transport',    label: 'Transport',        icon: '🚕' },
    { path: '/vendors',      label: 'Vendors',          icon: '🤝' },
  ]},
  { section: 'FINANCE',     items: [
    { path: '/finance',      label: 'Finance',          icon: '💰', badgeKey: 'pendingPayments', badgeColor: 'orange' },
  ]},
  { section: 'TOOLS',       items: [
    { path: '/reminders',    label: 'Reminders',        icon: '🔔', badgeKey: 'overdueReminders', badgeColor: 'red' },
    { path: '/reports',      label: 'Reports',          icon: '📊' },
  ]},
  { section: 'SETTINGS',    items: [
    { path: '/users',        label: 'User Roles',       icon: '👥', adminOnly: true },
  ]},
];

export default function Sidebar({ badges = {} }) {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">✈️</div>
        <h2>TravelCRM</h2>
        <span>travelandholidays.in</span>
      </div>

      {NAV.map(({ section, items }) => {
        const visible = items.filter(i => !i.adminOnly || user?.role === 'admin');
        if (!visible.length) return null;
        return (
          <div key={section} className="sidebar-section">
            <div className="sidebar-section-label">{section}</div>
            {visible.map(({ path, label, icon, badgeKey, badgeColor }) => {
              const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
              const count    = badgeKey ? badges[badgeKey] : 0;
              return (
                <button
                  key={path}
                  className={`nav-item${isActive ? ' active' : ''}`}
                  onClick={() => navigate(path)}
                >
                  <span className="nav-icon">{icon}</span>
                  {label}
                  {count > 0 && <span className={`nav-badge ${badgeColor || ''}`}>{count}</span>}
                </button>
              );
            })}
          </div>
        );
      })}

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px', marginBottom: 8 }}>
          <Avatar name={user?.name || 'U'} size={30} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{user?.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={logout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
