import React from 'react';
import { Camera, Map, ShieldAlert, Cpu, FileText, Activity, RefreshCw, Lock, Users, User, ChevronRight, Layers, ShieldCheck, ClipboardList, History, Zap, X, ArrowLeftRight } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, userRole, onSelectRole, onSwitchPortal, onOpenProfile, isMobileOpen, setIsMobileOpen }) {
  const adminNavItems = [
    { id: 'digital-twin', label: 'Live Road Map', icon: Map, badge: 'Live' },
    { id: 'my-reports', label: 'Reports & Municipal Audit', icon: ClipboardList, badge: 'Audit Hub' },
    { id: 'risk-calculator', label: 'Traffic & Risk Simulator', icon: ShieldAlert, badge: 'SUMO + AI' },
    { id: 'public-feed', label: 'Recent Incidents & Live Feed', icon: History, badge: 'Public' },
  ];

  const citizenNavItems = [
    { id: 'detection', label: 'Report Hazard & AI Scanner', icon: Camera, badge: 'Vision' },
    { id: 'my-reports', label: 'My Road Hazard Reports', icon: ClipboardList, badge: 'Tracking' },
    { id: 'public-feed', label: 'Recent Incidents & Live Feed', icon: History, badge: 'Public' },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : citizenNavItems;

  const handleNavClick = (item) => {
    if (item.id === 'switch-authority') {
      if (onSwitchPortal) onSwitchPortal();
    } else if (item.id === 'account') {
      if (onOpenProfile) onOpenProfile();
    } else {
      setActiveTab(item.id);
    }
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div 
          className="mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div>
          {/* Brand Header */}
          <div className="brand-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="brand-icon">
                <Activity size={22} color="#00E6B4" />
              </div>
              <div>
                <div className="brand-title">Road Guardian AI</div>
                <div className="brand-subtitle">AI Twin Intelligence</div>
              </div>
            </div>

            {/* Mobile Close Button */}
            {setIsMobileOpen && (
              <button 
                className="mobile-close-btn"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={20} color="#a1a1aa" />
              </button>
            )}
          </div>


          {/* Navigation Section */}
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '12px 10px 4px' }}>
            Platform Modules
          </div>

          <ul className="nav-list" style={{ marginTop: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(item)}
                >
                  <Icon size={18} color={isActive ? '#00E6B4' : '#71717a'} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: isActive ? 'rgba(0, 230, 180, 0.15)' : '#27272a', color: isActive ? '#00E6B4' : '#a1a1aa' }}>
                      {item.badge}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Direct Access Active Indicator */}
          <div className="public-teaser-box" style={{ borderColor: 'rgba(0, 230, 180, 0.2)', background: 'rgba(0, 230, 180, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00E6B4', fontWeight: 600, fontSize: '0.78rem' }}>
              <ShieldCheck size={14} /> Direct Access Unlocked
            </div>
            <div style={{ fontSize: '0.72rem', color: '#a1a1aa', marginTop: '4px', lineHeight: 1.4 }}>
              All modules (AI Scanner, Digital Twin, Risk Engine, Audit Reports) are fully open.
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <button 
            className="btn-secondary" 
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              fontSize: '0.78rem', 
              justifyContent: 'center', 
              gap: '6px',
              marginBottom: '6px',
              background: userRole === 'admin' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0, 230, 180, 0.1)',
              borderColor: userRole === 'admin' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(0, 230, 180, 0.3)',
              color: userRole === 'admin' ? '#F59E0B' : '#00E6B4'
            }}
            onClick={onSwitchPortal}
          >
            <ArrowLeftRight size={14} /> Switch Portal
          </button>
          <button 
            className="btn-secondary" 
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.78rem', justifyContent: 'center', gap: '6px' }}
            onClick={onOpenProfile}
          >
            <User size={14} /> Account Settings
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#71717a', marginTop: '4px' }}>
            <div className="status-dot"></div>
            <span>System Engine Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}
