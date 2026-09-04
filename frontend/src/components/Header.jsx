import React from 'react';
import { Wifi, CloudRain, ShieldAlert, Users, Bell, User, Menu, ArrowLeftRight, LogOut } from 'lucide-react';

export default function Header({ title, subtitle, summaryStats, userRole, user, onSelectRole, onSwitchPortal, onLogout, isMobileOpen, setIsMobileOpen }) {
  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Mobile Hamburger Button */}
        {setIsMobileOpen && (
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle mobile menu"
          >
            <Menu size={22} color="#00E6B4" />
          </button>
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <h1 className="page-title">{title}</h1>
            
            {/* Active Portal Badge & Switch Portal Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                padding: '3px 10px',
                borderRadius: '6px',
                background: userRole === 'admin' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 230, 180, 0.15)',
                color: userRole === 'admin' ? '#F59E0B' : '#00E6B4',
                border: userRole === 'admin' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(0, 230, 180, 0.3)'
              }}>
                {userRole === 'admin' ? 'Admin Portal' : 'Public Portal'}
              </span>

              <button
                type="button"
                onClick={onSwitchPortal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#e4e4e7',
                  fontWeight: 600,
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                title="Return to Portal Selection Screen"
              >
                <ArrowLeftRight size={13} color="#a1a1aa" />
                <span>Switch Portal</span>
              </button>
            </div>
          </div>
          <p className="page-desc">{subtitle}</p>
        </div>
      </div>

      <div className="header-telemetry">
        {userRole === 'admin' && (
          <>
            <div className="telemetry-chip telemetry-desktop-only">
              <Wifi size={15} color="#10B981" />
              <span>Server:</span>
              <span className="telemetry-val" style={{ color: '#10B981' }}>Connected</span>
            </div>

            <div className="telemetry-chip telemetry-desktop-only">
              <CloudRain size={15} color="#38BDF8" />
              <span>Weather:</span>
              <span className="telemetry-val" style={{ color: '#38BDF8' }}>
                {summaryStats?.weather_condition || 'Live GIS'}
              </span>
            </div>
          </>
        )}

        {/* User Account / Profile & Logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div 
              className="telemetry-chip"
              style={{ 
                padding: '4px 10px', 
                borderRadius: 'var(--radius-md)', 
                background: 'rgba(24, 24, 27, 0.7)',
                border: '1px solid var(--border-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {user.profile_picture ? (
                <img 
                  src={user.profile_picture} 
                  style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} 
                  alt={user.name} 
                />
              ) : (
                <div style={{ 
                  width: '22px', 
                  height: '22px', 
                  borderRadius: '50%', 
                  background: userRole === 'admin' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 230, 180, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.72rem', 
                  color: userRole === 'admin' ? '#F59E0B' : '#00E6B4', 
                  fontWeight: 'bold' 
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#e4e4e7' }}>{user.name.split(' ')[0]}</span>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                style={{
                  cursor: 'pointer',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                title="Sign Out of Session"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
