import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Navigation, Activity, Compass, AlertTriangle, ShieldCheck, 
  MapPin, RefreshCw, Layers, ShieldAlert, Cpu, CheckCircle2,
  TrendingDown, ArrowRight, Eye, Info, LocateFixed, Globe, Sun, Moon
} from 'lucide-react';

const getRiskColor = (severity) => {
  switch (severity) {
    case 'Critical': return '#EF4444'; // Neon Red
    case 'High': return '#F59E0B';     // Neon Amber
    case 'Medium': return '#38BDF8';   // Cyan
    case 'Low': return '#00E6B4';      // Mint
    default: return '#10B981';         // Emerald
  }
};

const sampleFallback = [
  { id: 101, Image: 'pothole_kasturba_gandhi.jpg', Landmark: 'Kasturba Gandhi Marg, Connaught Place', Latitude: 28.6258, Longitude: 77.2205, Severity: 'High', Risk_Score: 84.2 },
  { id: 102, Image: 'pothole_barakhamba.jpg', Landmark: 'Barakhamba Road, Near Metro Gate 2', Latitude: 28.6295, Longitude: 77.2285, Severity: 'Medium', Risk_Score: 58.0 },
  { id: 103, Image: 'pothole_rajiv_chowk.jpg', Landmark: 'Rajiv Chowk Radial Road 3', Latitude: 28.6328, Longitude: 77.2197, Severity: 'Critical', Risk_Score: 92.5 },
  { id: 104, Image: 'pothole_ashoka.jpg', Landmark: 'Ashoka Road, India Gate Junction', Latitude: 28.6180, Longitude: 77.2140, Severity: 'Critical', Risk_Score: 89.0 },
  { id: 105, Image: 'pothole_janpath.jpg', Landmark: 'Janpath Road, Near Cottage Industries', Latitude: 28.6210, Longitude: 77.2185, Severity: 'High', Risk_Score: 79.4 }
];

const TILE_PROVIDERS = {
  streets: {
    name: 'Street Map',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  },
  satellite: {
    name: 'Satellite Aerial',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: '&copy; Google Hybrid Satellite'
  },
  dark: {
    name: 'Dark Matter GIS',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    className: 'dark-map-tiles',
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }
};

export default function DigitalTwinMapView() {
  const [network, setNetwork] = useState([]);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [potholesList, setPotholesList] = useState([]);
  const [activePothole, setActivePothole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRoadNetwork, setShowRoadNetwork] = useState(true);
  const [showBuffers, setShowBuffers] = useState(false);
  const [mapStyle, setMapStyle] = useState('streets'); // Default to vibrant OpenStreetMap so it's never black

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);
  const activeTileLayerRef = useRef(null);

  // 1. Fetch live network and potholes telemetry
  useEffect(() => {
    Promise.all([
      fetch('/api/traffic/network').then(r => r.json()).catch(() => ({ segments: [] })),
      fetch('/api/detections').then(r => r.json()).catch(() => ({ success: false, detections: [] }))
    ]).then(([netData, detData]) => {
      const segs = netData.segments || [];
      setNetwork(segs);
      if (segs.length > 0) {
        setSelectedRoad(segs[0]);
      }

      const rawDetections = (detData.success && detData.detections && detData.detections.length > 0)
        ? detData.detections
        : sampleFallback;

      const valid = rawDetections.filter(d => 
        d.Longitude && d.Latitude && !isNaN(parseFloat(d.Longitude)) && !isNaN(parseFloat(d.Latitude)) && parseFloat(d.Longitude) !== 0
      );

      setPotholesList(valid);
      if (valid.length > 0) {
        setActivePothole(valid[0]);
      }
      setLoading(false);
    }).catch(err => {
      console.error('Digital Twin sync error:', err);
      setPotholesList(sampleFallback);
      setLoading(false);
    });
  }, []);

  // 2. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Reset container leaflet id if remounting
    if (mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [28.6250, 77.2200], // Central Delhi
      zoom: 13,
      zoomControl: true,
      attributionControl: false
    });

    // Add initial street tile layer
    const initialProvider = TILE_PROVIDERS[mapStyle] || TILE_PROVIDERS.streets;
    const tileLayer = L.tileLayer(initialProvider.url, {
      maxZoom: initialProvider.maxZoom || 19,
      subdomains: initialProvider.subdomains || 'abc',
      className: initialProvider.className || '',
      attribution: initialProvider.attribution
    }).addTo(map);

    activeTileLayerRef.current = tileLayer;
    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Invalidate size on load
    const timer = setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 3. Dynamic Tile Layer Switcher
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (activeTileLayerRef.current) {
      map.removeLayer(activeTileLayerRef.current);
    }

    const provider = TILE_PROVIDERS[mapStyle] || TILE_PROVIDERS.streets;
    const newLayer = L.tileLayer(provider.url, {
      maxZoom: provider.maxZoom || 19,
      subdomains: provider.subdomains || 'abc',
      className: provider.className || '',
      attribution: provider.attribution
    }).addTo(map);

    newLayer.bringToBack();
    activeTileLayerRef.current = newLayer;
  }, [mapStyle]);

  // 4. ResizeObserver ensures size is always valid
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // 5. Render Corridors and Hazards
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // A. Road Network Segments
    if (showRoadNetwork && network.length > 0) {
      network.forEach(road => {
        if (!road.start || !road.end) return;
        const isSelected = selectedRoad?.id === road.id;
        const color = getRiskColor(road.severity);

        const polyline = L.polyline([
          [road.start[1], road.start[0]],
          [road.end[1], road.end[0]]
        ], {
          color: isSelected ? '#00E6B4' : color,
          weight: isSelected ? 8 : 5,
          opacity: isSelected ? 1.0 : 0.85,
          lineJoin: 'round'
        }).addTo(layerGroup);

        polyline.bindTooltip(`
          <div style="font-family: inherit; font-size: 11px; padding: 2px;">
            <strong style="color: ${color}; font-size: 12px;">${road.name}</strong><br/>
            Severity: <b>${road.severity}</b> | Traffic: <b>${road.base_traffic} veh/hr</b>
          </div>
        `, { sticky: true });

        polyline.on('click', () => {
          setSelectedRoad(road);
        });
      });
    }

    // B. Pothole Hazards
    const hazards = potholesList.length > 0 ? potholesList : sampleFallback;
    hazards.forEach(hazard => {
      const lat = parseFloat(hazard.Latitude);
      const lon = parseFloat(hazard.Longitude);
      if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) return;

      const isCurrent = activePothole && (activePothole.id === hazard.id || (activePothole.Latitude === hazard.Latitude && activePothole.Longitude === hazard.Longitude));
      const color = getRiskColor(hazard.Severity);

      const marker = L.circleMarker([lat, lon], {
        radius: isCurrent ? 12 : 9,
        fillColor: color,
        color: isCurrent ? '#ffffff' : '#0f172a',
        weight: isCurrent ? 3.5 : 2,
        opacity: 1,
        fillOpacity: 0.95
      }).addTo(layerGroup);

      if (showBuffers) {
        L.circle([lat, lon], {
          radius: 160,
          color: color,
          weight: 1,
          opacity: 0.5,
          fillColor: color,
          fillOpacity: 0.15
        }).addTo(layerGroup);
      }

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.5; min-width: 170px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="background: ${color}25; color: ${color}; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${hazard.Severity} Hazard
            </span>
            <span style="font-weight: 800; color: #0f172a;">${hazard.Risk_Score || 75}/100</span>
          </div>
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">
            ${hazard.Landmark || hazard.Image || 'Reported Road Defect'}
          </div>
          <div style="color: #64748b; font-size: 11px;">
            Lat: ${lat.toFixed(4)}°, Lon: ${lon.toFixed(4)}°
          </div>
        </div>
      `);

      marker.on('click', () => {
        setActivePothole(hazard);
      });
    });

    // Auto-fit to bounds on initial load
    if (hazards.length > 0 && !map.__autoCentered) {
      map.__autoCentered = true;
      const pts = hazards
        .map(h => [parseFloat(h.Latitude), parseFloat(h.Longitude)])
        .filter(p => !isNaN(p[0]) && !isNaN(p[1]) && p[0] !== 0);
      if (pts.length > 0) {
        map.fitBounds(L.latLngBounds(pts), { padding: [50, 50], maxZoom: 14 });
      }
    }

  }, [network, potholesList, selectedRoad, activePothole, showRoadNetwork, showBuffers]);

  const locateHazardOnMap = (hazard) => {
    setActivePothole(hazard);
    const lat = parseFloat(hazard.Latitude);
    const lon = parseFloat(hazard.Longitude);
    if (!isNaN(lat) && !isNaN(lon) && mapRef.current) {
      mapRef.current.flyTo([lat, lon], 15, { duration: 1.2 });
    }
  };

  const resetCityOverview = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([28.6250, 77.2200], 13, { duration: 1.0 });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{ 
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(56, 189, 248, 0.05) 100%)',
        borderColor: 'rgba(0, 230, 180, 0.25)',
        padding: '18px 22px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Compass size={22} color="#00E6B4" /> 
              Digital Twin GIS Road Network Map
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#a1a1aa', marginTop: '4px' }}>
              Real-time spatial infrastructure telemetry, scanned road defects, and vulnerability zone heatmaps.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ 
              fontSize: '0.75rem', 
              background: 'rgba(0,230,180,0.12)', 
              color: '#00E6B4', 
              padding: '5px 12px', 
              borderRadius: '20px', 
              border: '1px solid rgba(0,230,180,0.3)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Activity size={13} className="spin-slow" /> GIS Engine Online
            </span>
            <span style={{
              fontSize: '0.75rem',
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38BDF8',
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontWeight: 600
            }}>
              ⚡ {potholesList.length} Active Hazards Mapped
            </span>
          </div>
        </div>

        {/* Quick Hazard Selector */}
        <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
          <div style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
            CLICK HAZARD TO FOCUS ON MAP:
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {potholesList.map((p, idx) => {
              const isSelected = activePothole && (activePothole.id === p.id || activePothole.Landmark === p.Landmark);
              const color = getRiskColor(p.Severity);
              return (
                <button
                  key={idx}
                  onClick={() => locateHazardOnMap(p)}
                  style={{
                    background: isSelected ? 'rgba(0, 230, 180, 0.2)' : '#18181b',
                    border: isSelected ? '1.5px solid #00E6B4' : `1px solid ${color}40`,
                    color: isSelected ? '#fff' : '#e4e4e7',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: isSelected ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                  <span>{p.Landmark?.split(',')[0] || p.Image}</span>
                  <span style={{ color: color, fontWeight: 700 }}>({p.Severity})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid: Map + Telemetry Panel */}
      <div className="grid-3" style={{ gridTemplateColumns: '1.65fr 1.35fr', gap: '20px' }}>
        
        {/* Left: GIS Map */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.0rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} color="#00E6B4" /> Municipal GIS Twin View
            </h3>

            {/* Map Controls & Tile Provider Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              
              {/* Tile Style Selector */}
              <div style={{ display: 'flex', background: '#18181b', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  type="button"
                  onClick={() => setMapStyle('streets')}
                  title="Vibrant Street Map"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: mapStyle === 'streets' ? '#00E6B4' : 'transparent',
                    color: mapStyle === 'streets' ? '#09090b' : '#a1a1aa',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  🗺️ Streets
                </button>
                <button
                  type="button"
                  onClick={() => setMapStyle('satellite')}
                  title="Satellite Aerial Imagery"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: mapStyle === 'satellite' ? '#38BDF8' : 'transparent',
                    color: mapStyle === 'satellite' ? '#09090b' : '#a1a1aa',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  🛰️ Satellite
                </button>
                <button
                  type="button"
                  onClick={() => setMapStyle('dark')}
                  title="Dark Matter GIS"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: mapStyle === 'dark' ? '#F59E0B' : 'transparent',
                    color: mapStyle === 'dark' ? '#09090b' : '#a1a1aa',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  🌙 Dark
                </button>
              </div>

              {/* Corridors Toggle */}
              <button
                type="button"
                onClick={() => setShowRoadNetwork(prev => !prev)}
                style={{
                  fontSize: '0.74rem',
                  background: showRoadNetwork ? 'rgba(0, 230, 180, 0.15)' : '#18181b',
                  color: showRoadNetwork ? '#00E6B4' : '#a1a1aa',
                  padding: '5px 9px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {showRoadNetwork ? '🛣️ Corridors' : '🛣️ Hidden'}
              </button>

              {/* Buffers Toggle */}
              <button
                type="button"
                onClick={() => setShowBuffers(prev => !prev)}
                style={{
                  fontSize: '0.74rem',
                  background: showBuffers ? 'rgba(245, 158, 11, 0.15)' : '#18181b',
                  color: showBuffers ? '#F59E0B' : '#a1a1aa',
                  padding: '5px 9px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {showBuffers ? '⭕ Buffers ON' : '⭕ Buffers'}
              </button>

              {/* Reset View */}
              <button
                type="button"
                onClick={resetCityOverview}
                title="Reset view to city center"
                style={{
                  fontSize: '0.74rem',
                  background: '#18181b',
                  color: '#e4e4e7',
                  padding: '5px 9px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <LocateFixed size={13} />
              </button>
            </div>
          </div>

          {/* Leaflet Map DOM Canvas */}
          <div style={{ 
            height: '560px', 
            minHeight: '560px',
            width: '100%',
            borderRadius: '12px', 
            overflow: 'hidden', 
            border: '1px solid rgba(255,255,255,0.12)', 
            position: 'relative' 
          }}>
            <div 
              ref={mapContainerRef} 
              style={{ 
                height: '100%', 
                width: '100%', 
                minHeight: '560px',
                background: '#1e293b' 
              }} 
            />

            {/* Severity Legend Overlay */}
            <div style={{
              position: 'absolute',
              bottom: '14px',
              left: '14px',
              background: 'rgba(12, 12, 16, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              padding: '8px 12px',
              zIndex: 1000,
              fontSize: '0.72rem',
              color: '#e4e4e7'
            }}>
              <div style={{ fontWeight: 700, marginBottom: '4px', color: '#fff' }}>DEFECT SEVERITY</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} /> Critical
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} /> High
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38BDF8' }} /> Medium
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00E6B4' }} /> Low
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selected Hazard & Corridor Telemetry Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Active Hazard Card */}
          <div className="glass-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.72rem', color: '#00E6B4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                INSPECTED ROAD HAZARD
              </span>
              {activePothole && (
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '10px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  background: `${getRiskColor(activePothole.Severity)}20`,
                  color: getRiskColor(activePothole.Severity)
                }}>
                  {activePothole.Severity} SEVERITY
                </span>
              )}
            </div>

            <h4 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 800 }}>
              {activePothole?.Landmark || activePothole?.Image || 'Select a hazard from map'}
            </h4>

            {activePothole && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
                <div style={{ background: '#18181b', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#71717a' }}>Risk Assessment</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: getRiskColor(activePothole.Severity), marginTop: '2px' }}>
                    {activePothole.Risk_Score || 75}/100
                  </div>
                </div>

                <div style={{ background: '#18181b', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#71717a' }}>GPS Coordinates</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                    {parseFloat(activePothole.Latitude).toFixed(4)}°, {parseFloat(activePothole.Longitude).toFixed(4)}°
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selected Corridor Telemetry */}
          <div className="glass-card" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '0.98rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Activity size={16} color="#38BDF8" /> Corridor Health Telemetry
            </h4>

            {selectedRoad ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{selectedRoad.name}</span>
                  <span style={{ color: getRiskColor(selectedRoad.severity), fontSize: '0.78rem', fontWeight: 700 }}>
                    {selectedRoad.severity} Condition
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                    <span>Reported Potholes:</span>
                    <strong style={{ color: '#F59E0B' }}>{selectedRoad.potholes || 0} defects</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                    <span>Traffic Volume:</span>
                    <strong style={{ color: '#fff' }}>{selectedRoad.base_traffic} veh/hr</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                    <span>Corridor Capacity:</span>
                    <strong style={{ color: '#fff' }}>{selectedRoad.base_capacity} veh/hr</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                    <span>Capacity Load Factor:</span>
                    <strong style={{ color: '#00E6B4' }}>
                      {((selectedRoad.base_traffic / selectedRoad.base_capacity) * 100).toFixed(0)}%
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.82rem', color: '#71717a' }}>Click on a corridor polyline on the map to inspect telemetry.</p>
            )}
          </div>

          {/* Defect Hotspot Leaderboard */}
          <div className="glass-card" style={{ padding: '18px', flex: 1 }}>
            <h4 style={{ fontSize: '0.98rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShieldAlert size={16} color="#EF4444" /> City Defect Hotspots
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {potholesList.map((hazard, i) => (
                <div 
                  key={hazard.id || i}
                  onClick={() => locateHazardOnMap(hazard)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: activePothole?.id === hazard.id ? 'rgba(0, 230, 180, 0.12)' : '#121214',
                    border: activePothole?.id === hazard.id ? '1px solid rgba(0, 230, 180, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getRiskColor(hazard.Severity) }} />
                    <span style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 600 }}>
                      {hazard.Landmark?.split(',')[0] || hazard.Image}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: getRiskColor(hazard.Severity), fontWeight: 700 }}>
                    {hazard.Severity} ({hazard.Risk_Score || 75})
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
