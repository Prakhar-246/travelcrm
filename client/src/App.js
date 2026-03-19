import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar     from './components/layout/Sidebar';
import Topbar      from './components/layout/Topbar';
import Login       from './pages/Login';
import Dashboard   from './pages/Dashboard';
import Leads       from './pages/Leads';
import Bookings    from './pages/Bookings';
import Hotels      from './pages/Hotels';
import Transport   from './pages/Transport';
import Vendors     from './pages/Vendors';
import Finance     from './pages/Finance';
import Reports     from './pages/Reports';
import Users       from './pages/Users';
import Packages    from './pages/Packages';
import Itineraries from './pages/Itinerary';
import Reminders   from './pages/Automation';

// ── Live Clock Hook ───────────────────────────────────────────
function useLiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

// ── System Notice Banner ──────────────────────────────────────
function NoticeBanner() {
  const now = useLiveClock();

  const timeStr = now.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  const dateStr = now.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <>
      <style>{`
        @keyframes pulseDot {
          0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.35); }
          50%       { box-shadow: 0 0 0 7px rgba(34,197,94,0.0);  }
        }

        .notice-banner {
          background: linear-gradient(90deg, #7f0000 0%, #b91c1c 45%, #991b1b 100%);
          border-bottom: 2px solid #450a0a;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 7px 18px;
          flex-shrink: 0;
          flex-wrap: wrap;
          row-gap: 6px;
        }

        /* ── Left: copyright text ── */
        .notice-left {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }
        .notice-badge {
          background: #450a0a;
          border: 1px solid #fca5a5;
          border-radius: 4px;
          padding: 2px 7px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: #fca5a5;
          flex-shrink: 0;
          white-space: nowrap;
          margin-top: 1px;
        }
        .notice-text {
          color: #fecaca;
          font-size: 11.5px;
          font-weight: 600;
          line-height: 1.5;
        }
        .notice-text strong {
          color: #fff;
          border-bottom: 1px solid rgba(255,255,255,0.55);
          padding-bottom: 1px;
        }

        /* ── Right: server status pills ── */
        .notice-right {
          display: flex;
          align-items: center;
          gap: 0;
          background: rgba(0,0,0,0.28);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 7px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .notice-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4px 12px;
          border-right: 1px solid rgba(255,255,255,0.12);
          line-height: 1.35;
          gap: 1px;
        }
        .notice-pill:last-child { border-right: none; }
        .notice-pill-label {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #fca5a5;
          white-space: nowrap;
        }
        .notice-pill-value {
          font-size: 11px;
          font-weight: 800;
          color: #fff;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .live-dot {
          width: 7px;
          height: 7px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulseDot 1.8s infinite;
          flex-shrink: 0;
        }
        .uptime-val { color: #86efac !important; }
        .clock-val  { font-family: monospace; letter-spacing: 0.5px; }

        /* ── Responsive breakpoints ── */

        /* Tablet: hide verbose copyright, keep short version */
        @media (max-width: 1024px) {
          .notice-text-full  { display: none; }
          .notice-text-short { display: inline; }
          .notice-pill { padding: 4px 9px; }
        }
        @media (min-width: 1025px) {
          .notice-text-full  { display: inline; }
          .notice-text-short { display: none; }
        }

        /* Mobile: stack banner vertically, hide server pills */
        @media (max-width: 680px) {
          .notice-banner  { padding: 6px 12px; flex-direction: column; align-items: flex-start; }
          .notice-right   { width: 100%; justify-content: space-between; }
          .notice-pill    { flex: 1; padding: 4px 6px; }
          .notice-text    { font-size: 10.5px; }
          .notice-badge   { font-size: 8px; padding: 2px 5px; }
        }

        @media (max-width: 420px) {
          .notice-pill-label { font-size: 7.5px; letter-spacing: 0.5px; }
          .notice-pill-value { font-size: 10px; }
          .notice-right      { flex-wrap: wrap; }
        }
      `}</style>

      <div className="notice-banner">

        {/* LEFT — Copyright */}
        <div className="notice-left">
          <span className="notice-badge">© Proprietary</span>
          <span className="notice-text">
            {/* Full text — desktop */}
            <span className="notice-text-full">
              This software system and all its components, data structures, business logic &amp; underlying
              algorithms are the exclusive intellectual property of{' '}
              <strong>Prakhar Sharma</strong>.{' '}
              Unauthorized access, reproduction, redistribution, reverse engineering or commercial
              exploitation of this platform — in whole or in part — is strictly prohibited and shall
              constitute a violation of applicable intellectual property laws. All rights reserved.
            </span>
            {/* Short text — tablet/mobile */}
            <span className="notice-text-short">
              Exclusive intellectual property of <strong>Prakhar Sharma</strong>.
              Unauthorized use strictly prohibited. All rights reserved.
            </span>
          </span>
        </div>

        {/* RIGHT — AWS Status Pills */}
        <div className="notice-right">

          <div className="notice-pill">
            <span className="notice-pill-label">Status</span>
            <span className="notice-pill-value">
              <span className="live-dot" />
              <span style={{ color: '#86efac' }}>LIVE</span>
            </span>
          </div>

          <div className="notice-pill">
            <span className="notice-pill-label">Hosted On</span>
            <span className="notice-pill-value">☁ AWS EC2 · ap-south-1</span>
          </div>

          <div className="notice-pill">
            <span className="notice-pill-label">Date (IST)</span>
            <span className="notice-pill-value">{dateStr}</span>
          </div>

          <div className="notice-pill">
            <span className="notice-pill-label">Server Time</span>
            <span className="notice-pill-value clock-val">{timeStr}</span>
          </div>

          <div className="notice-pill">
            <span className="notice-pill-label">Uptime</span>
            <span className="notice-pill-value uptime-val">99.98% ↑</span>
          </div>

        </div>
      </div>
    </>
  );
}

// ── Protected Layout ──────────────────────────────────────────
function ProtectedLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <NoticeBanner />
        <Topbar pathname={location.pathname} />
        <div className="page-content">
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/leads"       element={<Leads />} />
            <Route path="/bookings"    element={<Bookings />} />
            <Route path="/hotels"      element={<Hotels />} />
            <Route path="/transport"   element={<Transport />} />
            <Route path="/vendors"     element={<Vendors />} />
            <Route path="/finance"     element={<Finance />} />
            <Route path="/reports"     element={<Reports />} />
            <Route path="/packages"    element={<Packages />} />
            <Route path="/itineraries" element={<Itineraries />} />
            <Route path="/reminders"   element={<Reminders />} />
            <Route path="/users"       element={<Users />} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

// ── App Root ─────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#181c24', color: '#e8eaf0', border: '1px solid #252c3a', fontSize: 13 },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*"     element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}