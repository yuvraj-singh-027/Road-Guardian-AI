import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, KeyRound, Mail, Eye, EyeOff, AlertCircle, ArrowRight, Lock } from 'lucide-react';
import { validateAdminCredentials } from '../supabaseClient';

export default function AdminAuthModal({ onAuthSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Guarantee completely empty inputs when modal loads
  useEffect(() => {
    setEmail('');
    setPasscode('');
    setError(null);
  }, []);

  const handleLogin = (customEmail, customPasscode) => {
    setError(null);
    setLoading(true);

    const targetEmail = customEmail !== undefined ? customEmail : email;
    const targetPasscode = customPasscode !== undefined ? customPasscode : passcode;

    const result = validateAdminCredentials(targetEmail, targetPasscode);
    if (!result.success) {
      setError(result.error || 'Authentication error occurred');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setLoading(false);
      onAuthSuccess(result.user);
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'radial-gradient(ellipse at top, #221a10 0%, #09090b 70%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Inter, system-ui, sans-serif',
      position: 'relative'
    }}>
      {/* Back to Portal Selection */}
      <button
        type="button"
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '28px',
          left: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          color: '#a1a1aa',
          fontSize: '0.84rem',
          cursor: 'pointer',
          transition: 'all 0.15s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)'; }}
      >
        <ArrowLeft size={16} />
        <span>Change Portal</span>
      </button>

      {/* Main Form Card */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(24, 20, 16, 0.95)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '20px',
        padding: '36px 32px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(245, 158, 11, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: '999px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#F59E0B',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '14px'
          }}>
            <ShieldCheck size={15} />
            <span>Authority Admin Portal</span>
          </div>

          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: '8px',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
            Authority Administrator Login
          </h1>

          <p style={{
            fontSize: '0.88rem',
            color: '#a1a1aa',
            lineHeight: 1.5
          }}>
            Restricted access. Sign in with municipal administrator credentials to access Digital Twin GIS, PWD Dispatch Hub, and Traffic Simulator.
          </p>
        </div>

        {/* Error Alert if any */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '0.84rem',
            marginBottom: '20px',
            lineHeight: 1.45
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#e4e4e7', marginBottom: '6px' }}>
              Admin Email
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(18, 18, 20, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '0 12px'
            }}>
              <Mail size={16} color="#71717a" style={{ flexShrink: 0, marginRight: '10px' }} />
              <input
                type="text"
                required
                name="rg_admin_email_auth"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck="false"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter administrator email"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  padding: '12px 0',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Passcode Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#e4e4e7', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(18, 18, 20, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '0 12px'
            }}>
              <KeyRound size={16} color="#71717a" style={{ flexShrink: 0, marginRight: '10px' }} />
              <input
                type={showPasscode ? 'text' : 'password'}
                required
                name="rg_admin_passcode_auth"
                autoComplete="new-password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  padding: '12px 0',
                  fontSize: '0.9rem'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px' }}
                aria-label="Toggle passcode visibility"
              >
                {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '10px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '14px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#09090b',
              border: 'none',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.45)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.35)'; }}
          >
            <Lock size={16} />
            <span>{loading ? 'Verifying Credentials...' : 'Verify & Enter Admin Portal'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
