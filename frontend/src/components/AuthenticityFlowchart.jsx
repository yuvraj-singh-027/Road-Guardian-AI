import React, { useState } from 'react';
import {
  Camera,
  ShieldCheck,
  FileText,
  MapPin,
  Globe,
  Clock,
  Calendar,
  Fingerprint,
  Monitor,
  Grid,
  Cpu,
  Star,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

/**
 * AuthenticityFlowchart
 * Renders the exact 8-stage forensic pipeline from the user's diagram:
 * 1. PHOTO
 * 2. AUTHENTICITY CHECK ENGINE
 * 3. 3-Way Parallel Branch:
 *    - EXIF ("Camera?")
 *    - GPS ("Where?")
 *    - TIMESTAMP ("When?")
 * 4. pHash Check ("Duplicate hai?")
 * 5. Screen Detection ("Screen photo?")
 * 6. ELA Check ("Editing signs?")
 * 7. AI Detector ("Synthetic signs?")
 * 8. FINAL SCORE (0 - 100)
 */
export default function AuthenticityFlowchart({ authenticityData, previewImage = null }) {
  const [expandedNode, setExpandedNode] = useState(null);

  const data = authenticityData || {};
  const checks = data.checks_summary || {};
  const pipeline = data.flowchart_pipeline || {
    parallel_checks: [
      { id: 'exif_camera', title: 'EXIF Check', question: 'Camera?', subtitle: 'Hardware Model', status: checks.exif?.exif_valid ? 'passed' : 'warning', details: checks.exif?.camera_make || 'Standard Sensor' },
      { id: 'gps_where', title: 'GPS Check', question: 'Where?', subtitle: 'Geotag Verification', status: checks.exif?.gps_valid ? 'passed' : 'warning', details: checks.exif?.gps_valid ? 'GPS Attached' : 'Manual OSM Fallback' },
      { id: 'timestamp_when', title: 'TIMESTAMP Check', question: 'When?', subtitle: 'Capture Freshness', status: 'passed', details: 'Timestamp Recorded' }
    ],
    sequential_pipeline: [
      { id: 'phash_duplicate', title: 'pHash Check', question: 'Duplicate hai?', subtitle: 'Perceptual Hash Matrix', status: checks.phash?.is_duplicate ? 'failed' : 'passed', details: checks.phash?.is_duplicate ? 'Duplicate Submission Flagged' : 'Unique Incident Fingerprint' },
      { id: 'screen_detection', title: 'Screen Detection', question: 'Screen photo?', subtitle: 'Moiré Grid FFT Scan', status: checks.screen_detection?.is_screen_photo ? 'failed' : 'passed', details: checks.screen_detection?.is_screen_photo ? 'Digital Screen Retake' : 'Physical Asphalt Texture' },
      { id: 'ela_check', title: 'ELA Check', question: 'Editing signs?', subtitle: 'Error Level Analysis', status: checks.ela_editing?.is_edited ? 'failed' : 'passed', details: checks.ela_editing?.is_edited ? 'Pixel Splicing Detected' : 'Uniform Compression' },
      { id: 'ai_detector', title: 'AI Detector', question: 'Synthetic signs?', subtitle: 'Diffusion Texture Model', status: checks.ai_synthetic?.is_synthetic ? 'failed' : 'passed', details: checks.ai_synthetic?.is_synthetic ? 'Synthetic AI Artifacts' : 'Real Camera Photons' }
    ]
  };
  const parallelChecks = pipeline.parallel_checks || [];
  const sequentialPipeline = pipeline.sequential_pipeline || [];
  const finalScore = data.authenticity_score ?? 85;

  const toggleExpand = (id) => {
    setExpandedNode(expandedNode === id ? null : id);
  };

  const getNodeStatusBadge = (status) => {
    switch (status) {
      case 'passed':
        return {
          icon: <CheckCircle2 size={13} color="#10B981" />,
          color: '#10B981',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.4)'
        };
      case 'suspicious':
      case 'failed':
        return {
          icon: <XCircle size={13} color="#EF4444" />,
          color: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.4)'
        };
      case 'warning':
      default:
        return {
          icon: <AlertTriangle size={13} color="#F59E0B" />,
          color: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.4)'
        };
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(180deg, #121217 0%, #0d0d11 100%)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '24px 16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0',
      width: '100%',
      maxWidth: '680px',
      margin: '0 auto',
      fontFamily: 'inherit'
    }}>
      {/* FLOWCHART HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#00E6B4',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginBottom: '4px'
        }}>
          <Sparkles size={13} /> Multi-Signal Forensic Architecture
        </div>
        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 700 }}>
          Authenticity Pipeline Flow
        </h4>
        <div style={{ fontSize: '0.74rem', color: '#71717a', marginTop: '3px' }}>
          Click any stage to view forensic signal explainability
        </div>
      </div>

      {/* ─── NODE 1: PHOTO ─── */}
      <div
        onClick={() => toggleExpand('photo')}
        style={{
          width: '240px',
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'rgba(168, 85, 247, 0.08)',
          border: '1.5px solid rgba(168, 85, 247, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: '0 4px 16px rgba(168, 85, 247, 0.15)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          zIndex: 2
        }}
      >
        <div style={{
          background: '#2e1065',
          borderRadius: '8px',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Camera size={18} color="#c084fc" />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f3e8ff', letterSpacing: '0.5px' }}>
            PHOTO
          </div>
          <div style={{ fontSize: '0.68rem', color: '#c084fc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
            {pipeline.photo?.filename || 'Uploaded Image'}
          </div>
        </div>
      </div>

      {/* ARROW 1 -> 2 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '24px', justifyContent: 'center' }}>
        <div style={{ width: '2px', height: '16px', background: '#52525b' }} />
        <div style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid #71717a' }} />
      </div>

      {/* ─── NODE 2: AUTHENTICITY CHECK ENGINE ─── */}
      <div
        onClick={() => toggleExpand('engine')}
        style={{
          width: '280px',
          padding: '12px 18px',
          borderRadius: '12px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1.5px solid rgba(59, 130, 246, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.18)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          zIndex: 2
        }}
      >
        <div style={{
          background: '#1e3a8a',
          borderRadius: '8px',
          padding: '7px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShieldCheck size={20} color="#60a5fa" />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#bfdbfe', letterSpacing: '0.5px', lineHeight: 1.2 }}>
            AUTHENTICITY
          </div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#93c5fd' }}>
            CHECK ENGINE
          </div>
        </div>
      </div>

      {/* BRANCHING CONNECTOR TO 3 PARALLEL NODES */}
      <div style={{ width: '100%', maxWidth: '440px', height: '32px', position: 'relative', margin: '0 auto' }}>
        {/* Center vertical down to junction */}
        <div style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', width: '2px', height: '14px', background: '#52525b' }} />
        {/* Horizontal bar across 3 branches */}
        <div style={{ position: 'absolute', left: '16.6%', right: '16.6%', top: '14px', height: '2px', background: '#52525b' }} />
        {/* 3 drops with arrowheads */}
        {/* Left (EXIF) */}
        <div style={{ position: 'absolute', left: '16.6%', top: '14px', width: '2px', height: '14px', background: '#52525b' }} />
        <div style={{ position: 'absolute', left: '16.6%', top: '26px', transform: 'translateX(-3px)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid #71717a' }} />
        {/* Center (GPS) */}
        <div style={{ position: 'absolute', left: '50%', top: '14px', transform: 'translateX(-50%)', width: '2px', height: '14px', background: '#52525b' }} />
        <div style={{ position: 'absolute', left: '50%', top: '26px', transform: 'translateX(-4px)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid #71717a' }} />
        {/* Right (TIMESTAMP) */}
        <div style={{ position: 'absolute', right: '16.6%', top: '14px', width: '2px', height: '14px', background: '#52525b' }} />
        <div style={{ position: 'absolute', right: '16.6%', top: '26px', transform: 'translateX(3px)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid #71717a' }} />
      </div>

      {/* ─── 3-WAY PARALLEL ROW: EXIF | GPS | TIMESTAMP ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        width: '100%',
        maxWidth: '520px',
        zIndex: 2
      }}>
        {/* CARD A: EXIF */}
        {(() => {
          const exif = parallelChecks.find(c => c.id === 'exif') || {};
          const badge = getNodeStatusBadge(exif.status || 'warning');
          return (
            <div
              onClick={() => toggleExpand('exif')}
              style={{
                borderRadius: '12px',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1.5px solid rgba(34, 197, 94, 0.45)',
                padding: '12px 10px',
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                <div style={{ background: '#052e16', padding: '5px', borderRadius: '8px' }}>
                  <FileText size={16} color="#4ade80" />
                </div>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#bbf7d0' }}>
                EXIF
              </div>
              <div style={{ fontSize: '0.72rem', color: '#86efac', fontStyle: 'italic' }}>
                “Camera?”
              </div>
              <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', borderRadius: '6px', background: badge.bg, border: `1px solid ${badge.border}`, fontSize: '0.66rem', color: badge.color, fontWeight: 700 }}>
                {badge.icon} {exif.status_label || 'VERIFIED'}
              </div>
            </div>
          );
        })()}

        {/* CARD B: GPS */}
        {(() => {
          const gps = parallelChecks.find(c => c.id === 'gps') || {};
          const badge = getNodeStatusBadge(gps.status || 'passed');
          return (
            <div
              onClick={() => toggleExpand('gps')}
              style={{
                borderRadius: '12px',
                background: 'rgba(234, 179, 8, 0.08)',
                border: '1.5px solid rgba(234, 179, 8, 0.45)',
                padding: '12px 10px',
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(234, 179, 8, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                <div style={{ background: '#422006', padding: '5px', borderRadius: '8px' }}>
                  <Globe size={16} color="#facc15" />
                </div>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#fef08a' }}>
                GPS
              </div>
              <div style={{ fontSize: '0.72rem', color: '#fde047', fontStyle: 'italic' }}>
                “Where?”
              </div>
              <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', borderRadius: '6px', background: badge.bg, border: `1px solid ${badge.border}`, fontSize: '0.66rem', color: badge.color, fontWeight: 700 }}>
                {badge.icon} {gps.status_label || 'VALIDATED'}
              </div>
            </div>
          );
        })()}

        {/* CARD C: TIMESTAMP */}
        {(() => {
          const ts = parallelChecks.find(c => c.id === 'timestamp') || {};
          const badge = getNodeStatusBadge(ts.status || 'passed');
          return (
            <div
              onClick={() => toggleExpand('timestamp')}
              style={{
                borderRadius: '12px',
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1.5px solid rgba(244, 63, 94, 0.45)',
                padding: '12px 10px',
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(244, 63, 94, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                <div style={{ background: '#4c0519', padding: '5px', borderRadius: '8px' }}>
                  <Clock size={16} color="#fb7185" />
                </div>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#fecdd3' }}>
                TIMESTAMP
              </div>
              <div style={{ fontSize: '0.72rem', color: '#fda4af', fontStyle: 'italic' }}>
                “When?”
              </div>
              <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', borderRadius: '6px', background: badge.bg, border: `1px solid ${badge.border}`, fontSize: '0.66rem', color: badge.color, fontWeight: 700 }}>
                {badge.icon} {ts.status_label || 'CONFIRMED'}
              </div>
            </div>
          );
        })()}
      </div>

      {/* CONVERGING CONNECTOR BACK TO SINGLE LINE */}
      <div style={{ width: '100%', maxWidth: '440px', height: '32px', position: 'relative', margin: '0 auto' }}>
        {/* 3 upward vertical risers */}
        <div style={{ position: 'absolute', left: '16.6%', top: 0, width: '2px', height: '14px', background: '#52525b' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', width: '2px', height: '14px', background: '#52525b' }} />
        <div style={{ position: 'absolute', right: '16.6%', top: 0, width: '2px', height: '14px', background: '#52525b' }} />
        {/* Horizontal bar across 3 branches */}
        <div style={{ position: 'absolute', left: '16.6%', right: '16.6%', top: '14px', height: '2px', background: '#52525b' }} />
        {/* Center drop with arrow down */}
        <div style={{ position: 'absolute', left: '50%', top: '14px', transform: 'translateX(-50%)', width: '2px', height: '14px', background: '#52525b' }} />
        <div style={{ position: 'absolute', left: '50%', top: '26px', transform: 'translateX(-4px)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid #71717a' }} />
      </div>

      {/* ─── SEQUENTIAL PIPELINE ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '360px', gap: '0' }}>

        {/* ─── NODE 4: pHash Check ("Duplicate hai?") ─── */}
        {(() => {
          const phashItem = sequentialPipeline.find(s => s.id === 'phash') || {};
          const badge = getNodeStatusBadge(phashItem.status || 'passed');
          return (
            <>
              <div
                onClick={() => toggleExpand('phash')}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '12px',
                  background: 'rgba(147, 51, 234, 0.08)',
                  border: '1.5px solid rgba(147, 51, 234, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 16px rgba(147, 51, 234, 0.12)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  zIndex: 2
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#3b0764', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                    <Fingerprint size={18} color="#c084fc" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f3e8ff' }}>
                      pHash Check
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#c084fc', fontStyle: 'italic' }}>
                      “Duplicate hai?”
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 8px', borderRadius: '6px', background: badge.bg, border: `1px solid ${badge.border}`, fontSize: '0.68rem', color: badge.color, fontWeight: 700 }}>
                  {badge.icon} {phashItem.status_label || 'UNIQUE'}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '22px', justifyContent: 'center' }}>
                <div style={{ width: '2px', height: '14px', background: '#52525b' }} />
                <div style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid #71717a' }} />
              </div>
            </>
          );
        })()}

        {/* ─── NODE 5: Screen Detection ("Screen photo?") ─── */}
        {(() => {
          const screenItem = sequentialPipeline.find(s => s.id === 'screen') || {};
          const badge = getNodeStatusBadge(screenItem.status || 'passed');
          return (
            <>
              <div
                onClick={() => toggleExpand('screen')}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '12px',
                  background: 'rgba(14, 165, 233, 0.08)',
                  border: '1.5px solid rgba(14, 165, 233, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 16px rgba(14, 165, 233, 0.12)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  zIndex: 2
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#082f49', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                    <Monitor size={18} color="#38bdf8" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#e0f2fe' }}>
                      Screen Detection
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#7dd3fc', fontStyle: 'italic' }}>
                      “Screen photo?”
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 8px', borderRadius: '6px', background: badge.bg, border: `1px solid ${badge.border}`, fontSize: '0.68rem', color: badge.color, fontWeight: 700 }}>
                  {badge.icon} {screenItem.status_label || 'NATURAL SCENE'}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '22px', justifyContent: 'center' }}>
                <div style={{ width: '2px', height: '14px', background: '#52525b' }} />
                <div style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid #71717a' }} />
              </div>
            </>
          );
        })()}

        {/* ─── NODE 6: ELA Check ("Editing signs?") ─── */}
        {(() => {
          const elaItem = sequentialPipeline.find(s => s.id === 'ela') || {};
          const badge = getNodeStatusBadge(elaItem.status || 'passed');
          return (
            <>
              <div
                onClick={() => toggleExpand('ela')}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '12px',
                  background: 'rgba(249, 115, 22, 0.08)',
                  border: '1.5px solid rgba(249, 115, 22, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 16px rgba(249, 115, 22, 0.12)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  zIndex: 2
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#431407', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                    <Grid size={18} color="#fb923c" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#ffedd5' }}>
                      ELA Check
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#fdba74', fontStyle: 'italic' }}>
                      “Editing signs?”
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 8px', borderRadius: '6px', background: badge.bg, border: `1px solid ${badge.border}`, fontSize: '0.68rem', color: badge.color, fontWeight: 700 }}>
                  {badge.icon} {elaItem.status_label || 'HOMOGENEOUS'}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '22px', justifyContent: 'center' }}>
                <div style={{ width: '2px', height: '14px', background: '#52525b' }} />
                <div style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid #71717a' }} />
              </div>
            </>
          );
        })()}

        {/* ─── NODE 7: AI Detector ("Synthetic signs?") ─── */}
        {(() => {
          const aiItem = sequentialPipeline.find(s => s.id === 'ai') || {};
          const badge = getNodeStatusBadge(aiItem.status || 'passed');
          return (
            <>
              <div
                onClick={() => toggleExpand('ai')}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1.5px solid rgba(16, 185, 129, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.12)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  zIndex: 2
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#064e3b', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                    <Cpu size={18} color="#34d399" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#d1fae5' }}>
                      AI Detector
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#6ee7b7', fontStyle: 'italic' }}>
                      “Synthetic signs?”
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 8px', borderRadius: '6px', background: badge.bg, border: `1px solid ${badge.border}`, fontSize: '0.68rem', color: badge.color, fontWeight: 700 }}>
                  {badge.icon} {aiItem.status_label || 'REAL OPTICS'}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '22px', justifyContent: 'center' }}>
                <div style={{ width: '2px', height: '14px', background: '#52525b' }} />
                <div style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '6px solid #71717a' }} />
              </div>
            </>
          );
        })()}

        {/* ─── NODE 8: FINAL SCORE (0 – 100) ─── */}
        <div
          onClick={() => toggleExpand('final_score')}
          style={{
            width: '100%',
            padding: '14px 18px',
            borderRadius: '14px',
            background: finalScore >= 70
              ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
            border: finalScore >= 70
              ? '2px solid rgba(234, 179, 8, 0.7)'
              : '2px solid rgba(239, 68, 68, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: finalScore >= 70
              ? '0 6px 24px rgba(234, 179, 8, 0.25)'
              : '0 6px 24px rgba(239, 68, 68, 0.25)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 2
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#713f12',
              borderRadius: '10px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(234, 179, 8, 0.4)'
            }}>
              <Star size={22} color="#facc15" fill="#facc15" />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fef08a', letterSpacing: '0.5px' }}>
                FINAL SCORE
              </div>
              <div style={{ fontSize: '0.74rem', color: '#fde047', fontWeight: 600 }}>
                0 – 100
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: 900,
              color: finalScore >= 70 ? '#10B981' : finalScore >= 40 ? '#F59E0B' : '#EF4444',
              lineHeight: 1
            }}>
              {Math.round(finalScore)}
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#71717a' }}>/100</span>
            </div>
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: finalScore >= 70 ? '#34d399' : finalScore >= 40 ? '#fbbf24' : '#f87171',
              marginTop: '3px'
            }}>
              {authenticityData.status || (finalScore >= 70 ? 'HIGHLY AUTHENTIC' : 'SUSPICIOUS')}
            </div>
          </div>
        </div>

      </div>

      {/* EXPANDED EXPLANATION MODAL / DRAWER */}
      {expandedNode && (
        <div style={{
          marginTop: '16px',
          width: '100%',
          maxWidth: '520px',
          padding: '12px 16px',
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          fontSize: '0.78rem',
          color: '#d4d4d8',
          lineHeight: 1.5,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <strong style={{ color: '#00E6B4', textTransform: 'uppercase', fontSize: '0.72rem' }}>
              Forensic Deep-Dive: {expandedNode}
            </strong>
            <button
              onClick={() => setExpandedNode(null)}
              style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '0.72rem' }}
            >
              ✕ Close
            </button>
          </div>

          {expandedNode === 'photo' && (
            <div>
              Filename: <strong>{pipeline.photo?.filename || 'Uploaded File'}</strong><br />
              Resolution: <strong>{pipeline.photo?.resolution || '640x480'}</strong><br />
              Processed through 5-Layer authentic multi-modal forensic integrity gate before YOLO hazard extraction.
            </div>
          )}
          {expandedNode === 'engine' && (
            <div>
              <strong>Autonomous Multi-Signal Verification Engine</strong><br />
              Analyzes spatial metadata, temporal synchronization, 2D FFT periodic moiré interference, pixel error quantization (ELA), and generative synthetic noise.
            </div>
          )}
          {expandedNode === 'exif' && (
            <div>
              <strong>Camera Hardware Integrity:</strong><br />
              Extracts EXIF Make, Model, and software signatures. Flags any editing tags matching Adobe Photoshop, GIMP, Canva, Snapseed, or Pixlr.
            </div>
          )}
          {expandedNode === 'gps' && (
            <div>
              <strong>Spatial Coherence Validation:</strong><br />
              Confirms latitude and longitude fall inside valid terrestrial coordinates and aligns with OpenStreetMap road networks.
            </div>
          )}
          {expandedNode === 'timestamp' && (
            <div>
              <strong>Temporal Synchronization:</strong><br />
              Validates capture datetime stamps to ensure road hazard reporting reflects contemporary conditions rather than historical records.
            </div>
          )}
          {expandedNode === 'phash' && (
            <div>
              <strong>64-Bit DCT Perceptual Hash (Anti-Duplicate):</strong><br />
              Computes 8x8 luminance DCT matrix. Uses bitwise Hamming distance (&lt;= 8 bits) against municipal database to catch recycled image spam and fraudulent duplicates.
            </div>
          )}
          {expandedNode === 'screen' && (
            <div>
              <strong>2D Fast Fourier Transform (Screen Moiré Detection):</strong><br />
              Measures high-frequency periodic grid spikes caused by taking photos of computer screens or phones. Distinguishes natural asphalt textures from digital displays.
            </div>
          )}
          {expandedNode === 'ela' && (
            <div>
              <strong>Error Level Analysis (JPEG Quantization Forensics):</strong><br />
              Recompresses image in-memory at 90% quality and computes delta extrema. Highlights spliced, digitally inserted, or retouched potholes as anomalous high-luminance clusters.
            </div>
          )}
          {expandedNode === 'ai' && (
            <div>
              <strong>Synthetic Generative AI Diffusion Forensics:</strong><br />
              Analyzes high-frequency edge variance and chromatic aberration. Distinguishes genuine optical camera sensor noise from unnaturally smooth DALL-E / Midjourney diffusion surfaces.
            </div>
          )}
          {expandedNode === 'final_score' && (
            <div>
              <strong>Composite Authenticity Rating (0 – 100):</strong><br />
              Combines all 5 forensic layers. Images scoring below 40 are flagged as High Risk Tampered and blocked from polluting road maintenance logs.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
