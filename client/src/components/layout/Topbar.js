import { useNavigate } from 'react-router-dom';

const TITLES = {
  '/':            'Dashboard',
  '/leads':       'Lead Management',
  '/packages':    'Packages',
  '/itineraries': 'Itinerary Builder',
  '/bookings':    'Bookings',
  '/hotels':      'Hotel Supply',
  '/transport':   'Transport',
  '/vendors':     'Vendors',
  '/finance':     'Finance',
  '/reminders':   'Reminders & Automation',
  '/reports':     'Reports & Analytics',
  '/users':       'User Management',
};

export default function Topbar({ pathname }) {
  const navigate = useNavigate();
  const title    = Object.entries(TITLES).find(([k]) => k === '/' ? pathname === '/' : pathname.startsWith(k))?.[1] || 'Travel CRM';

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        <div className="search-bar">
          <span>🔍</span>
          <input placeholder="Search anything..." />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/leads', { state: { openAdd: true } })}>
          ➕ New Lead
        </button>
      </div>
    </header>
  );
}
