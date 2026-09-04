import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, Loader, CheckCircle2, AlertCircle, Sparkles, Key, Globe, ExternalLink, Settings } from 'lucide-react';
import { signInWithGoogle, getVerifiedPublicSession, getSupabaseConfig, saveSupabaseConfig } from '../supabaseClient';

export default function PublicAuthModal({ onAuthSuccess, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  // Configuration state in case Supabase credentials need to be set
  const [config, setConfig] = useState(getSupabaseConfig());
  const [showConfigForm, setShowConfigForm] = useState(!config.isConfigured);
  const [inputUrl, setInputUrl] = useState(config.url || '');
  const [inputKey, setInputKey] = useState(config.key || '');

  // 1. Check if user is returning from a real Google OAuth redirect
  useEffect(() => {
    async function checkRedirectSession() {
      try {
        const result = await getVerifiedPublicSession();
        if (result && result.verified && result.user) {
          setStatusMsg('Google account verified! Entering Public Citizen Portal...');
          setTimeout(() => {
            onAuthSuccess(result.user);
          }, 500);
        }
      } catch (err) {
        console.error('Redirect session error:', err);
      }
    }
    checkRedirectSession();
  }, [onAuthSuccess]);

  // 2. Trigger REAL Google OAuth
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setStatusMsg('Redirecting to Google login...');

    try {
      await signInWithGoogle();
      // Browser will now redirect to accounts.google.com
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to initialize Google authentication.');
      setLoading(false);
      setStatusMsg(null);
    }
  };

  // 3. Save Supabase credentials from UI if not in .env
  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!inputUrl.trim() || !inputKey.trim()) {
      setError('Both Supabase Project URL and Anon Key are required.');
      return;
    }
    if (!inputUrl.startsWith('http')) {
      setError('Supabase URL must start with https://');
      return;
    }

    saveSupabaseConfig(inputUrl, inputKey);
    const updated = getSupabaseConfig();
    setConfig(updated);
    setShowConfigForm(false);
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'radial-gradient(ellipse at top, #101c22 0%, #09090b 70%)',
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

      {/* Main Container Card */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(18, 22, 26, 0.95)',
        border: '1px solid rgba(0, 230, 180, 0.25)',
        borderRadius: '20px',
        padding: '36px 30px',
        textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 230, 180, 0.08)'
      }}>
        {/* Portal Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '999px',
          background: 'rgba(0, 230, 180, 0.1)',
          color: '#00E6B4',
          border: '1px solid rgba(0, 230, 180, 0.25)',
          fontSize: '0.74rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '16px'
        }}>
          <ShieldCheck size={14} />
          <span>Real Google Authentication</span>
        </div>

        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          marginBottom: '8px',
          fontFamily: 'Space Grotesk, sans-serif'
        }}>
          Citizen Google Verification
        </h1>

        <p style={{
          fontSize: '0.9rem',
          color: '#a1a1aa',
          lineHeight: 1.5,
          marginBottom: '26px'
        }}>
          Sign in directly with your real Google account via Supabase. We verify your email to authenticate road hazard submissions.
        </p>

        {/* Error Alert */}
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
            textAlign: 'left',
            marginBottom: '20px',
            lineHeight: 1.45
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Status Message */}
        {statusMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(0, 230, 180, 0.1)',
            border: '1px solid rgba(0, 230, 180, 0.25)',
            color: '#00E6B4',
            fontSize: '0.84rem',
            textAlign: 'left',
            marginBottom: '20px'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* If Supabase is NOT configured yet, show the Project Credentials prompt */}
        {!config.isConfigured || showConfigForm ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '20px',
            textAlign: 'left',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#00E6B4', fontSize: '0.88rem', fontWeight: 600 }}>
              <Settings size={16} />
              <span>Connect Supabase Project</span>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#a1a1aa', lineHeight: 1.5, marginBottom: '16px' }}>
              To enable real Google OAuth, enter your Supabase project credentials (from <em>Supabase Dashboard &gt; Project Settings &gt; API</em>):
            </p>

            <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: '#d4d4d8', fontWeight: 600, marginBottom: '4px' }}>
                  Project URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://your-project.supabase.co"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(12, 12, 14, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: '#d4d4d8', fontWeight: 600, marginBottom: '4px' }}>
                  Anon Public Key
                </label>
                <input
                  type="password"
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(12, 12, 14, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '6px',
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: '#00E6B4',
                  color: '#09090b',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Save & Connect Google OAuth
              </button>
            </form>
          </div>
        ) : (
          /* Actual Google Sign-In Button */
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '14px 20px',
                borderRadius: '12px',
                background: '#ffffff',
                color: '#1f2937',
                border: 'none',
                fontSize: '0.98rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                opacity: loading ? 0.8 : 1
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <>
                  <Loader size={20} className="spin" color="#1f2937" />
                  <span>Redirecting to Google...</span>
                </>
              ) : (
                <>
                  {/* Real Google Colored 'G' SVG Logo */}
                  <svg width="22" height="22" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div style={{ marginTop: '12px', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setShowConfigForm(true)}
                style={{ background: 'transparent', border: 'none', color: '#71717a', fontSize: '0.74rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Change Supabase Project Keys
              </button>
            </div>
          </div>
        )}

        {/* Security and Informational Checklist */}
        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          fontSize: '0.8rem',
          color: '#71717a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} color="#00E6B4" />
            <span>Actual Google OAuth consent & identity verification</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} color="#00E6B4" />
            <span>Secure tokens managed by Supabase</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={14} color="#00E6B4" />
            <span>Verified email required to submit road hazards</span>
          </div>
        </div>
      </div>
    </div>
  );
}
