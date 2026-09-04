import React from 'react';
import { Users, ShieldAlert, ArrowRight, Activity } from 'lucide-react';

export default function PortalSelectionSlide({ onSelectPortal }) {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#09090b',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: 'rgba(0, 230, 180, 0.12)',
          border: '1px solid rgba(0, 230, 180, 0.25)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <Activity size={26} color="#00E6B4" />
        </div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          letterSpacing: '-0.5px',
          marginBottom: '6px'
        }}>
          Road Guardian AI
        </h1>
        <p style={{ color: '#71717a', fontSize: '0.95rem' }}>
          Select your portal to continue
        </p>
      </div>

      {/* Two Clean Portal Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 320px))',
        gap: '20px',
        width: '100%',
        maxWidth: '680px',
        justifyContent: 'center'
      }}>
        {/* Public Portal Card */}
        <div
          onClick={() => onSelectPortal('public')}
          style={{
            background: 'rgba(18, 18, 22, 0.8)',
            border: '1px solid rgba(0, 230, 180, 0.25)',
            borderRadius: '16px',
            padding: '32px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = '#00E6B4';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 230, 180, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(0, 230, 180, 0.25)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(0, 230, 180, 0.1)',
            border: '1px solid rgba(0, 230, 180, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={26} color="#00E6B4" />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#fff', margin: 0 }}>
            Public Portal
          </h2>

          <p style={{ color: '#00E6B4', fontSize: '0.88rem', fontWeight: 500, margin: 0 }}>
            Citizen Access
          </p>

          <div style={{
            marginTop: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.84rem',
            color: '#a1a1aa',
            fontWeight: 500
          }}>
            <span>Enter</span>
            <ArrowRight size={15} />
          </div>
        </div>

        {/* Admin Portal Card */}
        <div
          onClick={() => onSelectPortal('admin')}
          style={{
            background: 'rgba(18, 18, 22, 0.8)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '16px',
            padding: '32px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = '#F59E0B';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(245, 158, 11, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.25)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={26} color="#F59E0B" />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#fff', margin: 0 }}>
            Admin Portal
          </h2>

          <p style={{ color: '#F59E0B', fontSize: '0.88rem', fontWeight: 500, margin: 0 }}>
            Authority Access
          </p>

          <div style={{
            marginTop: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.84rem',
            color: '#a1a1aa',
            fontWeight: 500
          }}>
            <span>Enter</span>
            <ArrowRight size={15} />
          </div>
        </div>
      </div>
    </div>
  );
}
