// StatusBadge
export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</span>;
}

// Modal
export function Modal({ title, onClose, children, lg }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal${lg ? ' modal-lg' : ''}`}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Stars rating
export function Stars({ n = 3 }) {
  return <span className="stars">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>;
}

// Avatar
export function Avatar({ name = '?', size = 32 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// Loading spinner
export function Spinner({ size = 20 }) {
  return <div className="spinner" style={{ width: size, height: size }} />;
}

// Empty state
export function EmptyState({ icon = '📭', message = 'No data found', action }) {
  return (
    <div className="empty-state">
      <div className="icon">{icon}</div>
      <p>{message}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

// Payment progress bar
export function PaymentBar({ paid, total }) {
  const pct = total > 0 ? Math.min(100, (paid / total) * 100).toFixed(0) : 0;
  return (
    <div>
      <div className="payment-bar">
        <div className="payment-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Confirm delete button
export function ConfirmDelete({ onConfirm }) {
  const handleClick = () => {
    if (window.confirm('Are you sure you want to delete this?')) onConfirm();
  };
  return (
    <button className="btn btn-danger btn-sm" onClick={handleClick}>🗑</button>
  );
}

// Stat card
export function StatCard({ icon, label, value, change, changeType = 'up', color }) {
  return (
    <div className="stat-card" style={{ '--c': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && <div className={`stat-change ${changeType}`}>{changeType === 'up' ? '↑' : '↓'} {change}</div>}
    </div>
  );
}

// Format currency INR
export function fmtINR(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

// Format date
export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
