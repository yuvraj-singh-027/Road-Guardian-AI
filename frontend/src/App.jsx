import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AIDetectionView from './components/AIDetectionView';
import DigitalTwinMapView from './components/DigitalTwinMapView';
import TrafficRerouteView from './components/TrafficRerouteView';
import RiskCalculatorView from './components/RiskCalculatorView';
import MyReportsView from './components/MyReportsView';
import PublicFeedHistoryView from './components/PublicFeedHistoryView';
import UserProfileModal from './components/UserProfileModal';
import CitizenGuideWidget from './components/CitizenGuideWidget';
import PortalSelectionSlide from './components/PortalSelectionSlide';
import PublicAuthModal from './components/PublicAuthModal';
import AdminAuthModal from './components/AdminAuthModal';
import { signOutAuth, getVerifiedPublicSession, isSupabaseConfigured } from './supabaseClient';
import { Camera, Map, ShieldAlert, Cpu, FileText, Activity, Lock, KeyRound, ArrowUpRight, ArrowDownRight, Loader } from 'lucide-react';

// --- GLOBAL FETCH TOKEN INTERCEPTOR ---
if (typeof window !== 'undefined' && !window.__fetch_intercepted__) {
  window.__fetch_intercepted__ = true;
  const originalFetch = window.fetch;
  window.fetch = async function (url, options = {}) {
    const token = localStorage.getItem('road_guardian_token');
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    const response = await originalFetch(url, options);
    
    // Handle session expiration (401)
    if (response.status === 401 && !url.includes('/api/auth/login') && !url.includes('/api/auth/signup')) {
      localStorage.removeItem('road_guardian_token');
      sessionStorage.removeItem('road_guardian_role');
      sessionStorage.removeItem('road_guardian_selected_portal');
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    
    return response;
  };
}

const DEFAULT_MOCK_USER = {
  id: 1,
  name: 'Authority Admin',
  email: 'admin@roadguardian.gov',
  role: 'admin',
  department: 'Municipal Road Infrastructure',
  badge_number: 'RG-ADMIN-DIRECT',
  profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
};

export default function App() {
  const [authenticatedRole, setAuthenticatedRole] = useState(() => {
    const stored = localStorage.getItem('road_guardian_auth_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed?.role || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('road_guardian_auth_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.user) return parsed.user;
      } catch {}
    }
    return DEFAULT_MOCK_USER;
  });

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialAction, setAuthInitialAction] = useState('login');
  const [selectedPortal, setSelectedPortal] = useState(() => sessionStorage.getItem('road_guardian_selected_portal') || null);
  const [userRole, setUserRole] = useState(() => sessionStorage.getItem('road_guardian_role') || 'public');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [activeTab, setActiveTab] = useState(() => (sessionStorage.getItem('road_guardian_role') === 'admin' ? 'digital-twin' : 'detection'));
  const [summaryStats, setSummaryStats] = useState(null);

  // Check Supabase session on mount (e.g. returning from Google OAuth redirect)
  useEffect(() => {
    async function checkSupabaseSession() {
      const isConfigured = typeof isSupabaseConfigured === 'function' ? isSupabaseConfigured() : isSupabaseConfigured;
      if (isConfigured) {
        const sessionResult = await getVerifiedPublicSession();
        if (sessionResult?.verified && sessionResult.user) {
          handlePublicAuthSuccess(sessionResult.user);
        }
      }
    }
    checkSupabaseSession();
  }, []);

  // Fetch summary stats
  useEffect(() => {
    fetch('/api/stats/summary')
      .then((res) => res.json())
      .then((data) => setSummaryStats(data))
      .catch((err) => console.error('Stats sync error:', err));
  }, [activeTab]);

  const handleSelectRole = (role) => {
    setUserRole(role);
    sessionStorage.setItem('road_guardian_role', role);
    setActiveTab(role === 'admin' ? 'digital-twin' : 'detection');
  };

  const handleSelectPortal = (portal) => {
    setSelectedPortal(portal);
    sessionStorage.setItem('road_guardian_selected_portal', portal);
    if (authenticatedRole === portal) {
      handleSelectRole(portal);
    }
  };

  const handlePublicAuthSuccess = (verifiedUser) => {
    setUser(verifiedUser);
    setUserRole('public');
    setAuthenticatedRole('public');
    setSelectedPortal('public');
    sessionStorage.setItem('road_guardian_role', 'public');
    sessionStorage.setItem('road_guardian_selected_portal', 'public');
    setActiveTab('detection');
  };

  const handleAdminAuthSuccess = (adminUser) => {
    setUser(adminUser);
    setUserRole('admin');
    setAuthenticatedRole('admin');
    setSelectedPortal('admin');
    sessionStorage.setItem('road_guardian_role', 'admin');
    sessionStorage.setItem('road_guardian_selected_portal', 'admin');
    setActiveTab('digital-twin');
  };

  const handleOpenPortalSlide = () => {
    setSelectedPortal(null);
    sessionStorage.removeItem('road_guardian_selected_portal');
  };

  const handleLogout = async () => {
    await signOutAuth();
    setAuthenticatedRole(null);
    setSelectedPortal(null);
    setUserRole('public');
    setUser(DEFAULT_MOCK_USER);
    setShowProfileModal(false);
  };

  const getTabHeader = () => {
    switch (activeTab) {
      case 'detection':
        return {
          title: 'AI Hazard Perception',
          subtitle: 'Real-time road damage AI scanner'
        };
      case 'my-reports':
        return {
          title: userRole === 'admin' ? 'Authority Reports & Municipal Audit Hub' : 'My Road Hazard Reports & Tracking',
          subtitle: 'Track real-time lifecycle stages, municipal assignment, repair progress, PDF reports, and n8n workflows'
        };
      case 'public-feed':
        return {
          title: 'Recent Public Incident Reports (Live Feed)',
          subtitle: 'Live city-wide telemetry feed of verified road hazard reports, severity distribution, and spatial analytics'
        };
      case 'digital-twin':
        return {
          title: 'Digital Twin GIS Road Network Map',
          subtitle: 'Real-time spatial infrastructure telemetry, scanned road defects, and vulnerability zone heatmaps'
        };
      case 'traffic-simulator':
      case 'traffic-reroute':
        return {
          title: 'SUMO Traffic Simulator & Rerouting Engine',
          subtitle: 'Microscopic bottleneck kinematics, road closure impact modeling, and dynamic city rerouting'
        };
      case 'risk-calculator':
        return {
          title: 'Multi-Factor Road Risk Evaluator',
          subtitle: 'Dynamic 0-100 risk scoring algorithm combining perception, vehicle speed, weather, and school proximity'
        };
      case 'municipal-report':
        return {
          title: 'Municipal PDF Audit Report Generator',
          subtitle: 'Generate and download executive-ready municipal audit reports for road maintenance authorities'
        };
      default:
        return { title: 'Road Guardian AI', subtitle: 'Real-Time Road Health & Traffic Digital Twin' };
    }
  };

  const headerInfo = getTabHeader();

  const renderRestrictedAccessNotice = () => (
    <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: '560px', margin: '40px auto' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
        <Lock size={28} color="#F59E0B" />
      </div>
      <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>Authority Restricted Module</h2>
      <p style={{ color: '#a1a1aa', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.5 }}>
        This module requires Authority Administrator credentials. Please log in or switch to an authorized municipal account to access city traffic simulations, multi-factor risk engines, and municipal audit reports.
      </p>
      <button 
        className="btn-primary" 
        onClick={handleOpenPortalSlide}
        style={{ background: '#F59E0B', color: '#09090b', fontWeight: 600, width: '100%', justifyContent: 'center' }}
      >
        <Lock size={16} /> Switch to Authority Portal
      </button>
    </div>
  );

  // 1. Show the slide first that has an option of Public and Admin portal
  if (!selectedPortal) {
    return <PortalSelectionSlide onSelectPortal={handleSelectPortal} />;
  }

  // 2. If Public Portal is selected, authenticate & verify via Google OAuth
  if (selectedPortal === 'public' && authenticatedRole !== 'public') {
    return (
      <PublicAuthModal 
        onAuthSuccess={handlePublicAuthSuccess}
        onBack={handleOpenPortalSlide}
      />
    );
  }

  // 3. If Admin Portal is selected, authenticate via authorized email and passcode
  if (selectedPortal === 'admin' && authenticatedRole !== 'admin') {
    return (
      <AdminAuthModal 
        onAuthSuccess={handleAdminAuthSuccess}
        onBack={handleOpenPortalSlide}
      />
    );
  }

  // 4. Render main application layout once authenticated for chosen portal
  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={userRole}
        onSelectRole={handleSelectRole}
        onSwitchPortal={handleOpenPortalSlide}
        onOpenProfile={() => setShowProfileModal(true)}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      <div className="main-content">
        <Header 
          title={headerInfo.title} 
          subtitle={headerInfo.subtitle} 
          summaryStats={summaryStats} 
          userRole={userRole}
          user={user}
          onSelectRole={handleSelectRole}
          onSwitchPortal={handleOpenPortalSlide}
          onLogout={handleLogout}
          onOpenProfile={() => setShowProfileModal(true)}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Global Summary Metric Banner — 3 Clean Metric Cards (Exclusively on Digital Twin Map view) */}
        {activeTab === 'digital-twin' && (
          <div className="grid-3" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div>
                <div className="stat-label">Total Scanned Hazards</div>
                <div className="stat-val">{summaryStats?.total_scanned ?? 0}</div>
                <div style={{ fontSize: '0.72rem', color: summaryStats?.trend_direction === 'down' ? '#10B981' : '#00E6B4', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {summaryStats?.trend_direction === 'down' ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                  {summaryStats?.trend_percent !== undefined 
                    ? `${summaryStats.trend_percent >= 0 ? '+' : ''}${summaryStats.trend_percent}% from last week` 
                    : '+14.2% from last week'}
                </div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(0,230,180,0.1)' }}>
                <Activity size={20} color="#00E6B4" />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Critical Potholes</div>
                <div className="stat-val" style={{ color: '#EF4444' }}>{summaryStats?.critical_potholes !== undefined ? summaryStats.critical_potholes : 18}</div>
                <div style={{ fontSize: '0.72rem', color: '#EF4444', marginTop: '4px' }}>
                  Action Required
                </div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <ShieldAlert size={20} color="#EF4444" />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Average City Risk (All Scans)</div>
                <div className="stat-val" style={{ color: '#F59E0B' }}>{summaryStats?.active_road_risk_score !== undefined ? summaryStats.active_road_risk_score : 68.4}</div>
                <div style={{ 
                  fontSize: '0.72rem', 
                  color: (summaryStats?.active_road_risk_score || 0) > 70 ? '#EF4444' : (summaryStats?.active_road_risk_score || 0) > 35 ? '#F59E0B' : '#10B981', 
                  marginTop: '4px',
                  fontWeight: 600 
                }}>
                  {(summaryStats?.active_road_risk_score || 0) > 70 ? 'High Risk Level' : (summaryStats?.active_road_risk_score || 0) > 35 ? 'Moderate Risk Level' : 'Low Risk Level'}
                </div>
              </div>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(245,158,11,0.1)' }}>
                <Cpu size={20} color="#F59E0B" />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic View Component */}
        {activeTab === 'detection' && (
          userRole === 'admin' ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: '560px', margin: '40px auto' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0, 230, 180, 0.1)', border: '1px solid rgba(0, 230, 180, 0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Camera size={28} color="#00E6B4" />
              </div>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>Citizen Hazard Perception Portal</h2>
              <p style={{ color: '#a1a1aa', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.5 }}>
                AI Hazard Perception Scanner and citizen incident reporting are dedicated to the Citizen Public Portal. As an Authority Administrator, you manage infrastructure via the Digital Twin GIS Map, SUMO Traffic Simulator, and Municipal Audit Hub.
              </p>
              <button 
                className="btn-primary" 
                onClick={() => setActiveTab('digital-twin')}
                style={{ background: '#00E6B4', color: '#09090b', fontWeight: 600, width: '100%', justifyContent: 'center' }}
              >
                Go to Digital Twin GIS Map
              </button>
            </div>
          ) : (
            <AIDetectionView 
              userRole={userRole} 
              user={user}
              onNavigateToAuthenticity={() => setActiveTab('authenticity')}
              onNavigateToReports={() => setActiveTab('my-reports')}
            />
          )
        )}
        {activeTab === 'my-reports' && (
          <MyReportsView 
            userRole={userRole} 
            user={user}
            onNavigateToDetection={() => setActiveTab(userRole === 'admin' ? 'digital-twin' : 'detection')} 
          />
        )}
        {activeTab === 'public-feed' && (
          <PublicFeedHistoryView 
            onNavigateToReport={() => setActiveTab(userRole === 'admin' ? 'digital-twin' : 'detection')} 
            onNavigateToMap={() => userRole === 'admin' ? setActiveTab('digital-twin') : null} 
          />
        )}
        {activeTab === 'digital-twin' && (
          userRole === 'admin' ? <DigitalTwinMapView /> : renderRestrictedAccessNotice()
        )}
        {(activeTab === 'traffic-simulator' || activeTab === 'traffic-reroute') && (
          userRole === 'admin' ? <TrafficRerouteView /> : renderRestrictedAccessNotice()
        )}
        {activeTab === 'risk-calculator' && (
          userRole === 'admin' ? <RiskCalculatorView /> : renderRestrictedAccessNotice()
        )}
      </div>

      {showProfileModal && (
        <UserProfileModal 
          user={user}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
          onUpgradeSuccess={(updatedUser) => {
            setUser(updatedUser);
            setUserRole(updatedUser.role);
          }}
        />
      )}

      {showAuthModal && (
        <AuthPortal
          onAuthSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setShowAuthModal(false);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      <CitizenGuideWidget userRole={userRole} />
    </div>
  );
}
