import React, { useState, useMemo } from 'react';

// Geographic bounds for Ogere Remo tactical grid
const BOUNDS = {
  minLat: 6.9240,
  maxLat: 6.9440,
  minLng: 3.6220,
  maxLng: 3.6500,
};

const SECTORS_GEO = [
  {
    id: 'sec_expressway',
    name: 'KM 66-68 Expressway Corridor',
    code: 'SEC-ALPHA',
    color: 'rgba(239, 68, 68, 0.12)',
    borderColor: '#ef4444',
    points: [
      { lat: 6.9420, lng: 3.6400 },
      { lat: 6.9435, lng: 3.6480 },
      { lat: 6.9360, lng: 3.6495 },
      { lat: 6.9345, lng: 3.6415 },
    ],
  },
  {
    id: 'sec_palace',
    name: 'Aafin Ologere Palace & Royal Esplanade',
    code: 'SEC-ROYAL',
    color: 'rgba(201, 150, 58, 0.12)',
    borderColor: '#C9963A',
    points: [
      { lat: 6.9390, lng: 3.6305 },
      { lat: 6.9390, lng: 3.6360 },
      { lat: 6.9345, lng: 3.6360 },
      { lat: 6.9345, lng: 3.6305 },
    ],
  },
  {
    id: 'sec_trailer',
    name: 'Ogere Trailer Park & Heavy Logistics Hub',
    code: 'SEC-LOGISTICS',
    color: 'rgba(249, 115, 22, 0.12)',
    borderColor: '#f97316',
    points: [
      { lat: 6.9385, lng: 3.6320 },
      { lat: 6.9385, lng: 3.6375 },
      { lat: 6.9345, lng: 3.6375 },
      { lat: 6.9345, lng: 3.6320 },
    ],
  },
  {
    id: 'sec_agbele',
    name: 'Agbele Cultural & Ancestral Ridge',
    code: 'SEC-HERITAGE',
    color: 'rgba(16, 185, 129, 0.12)',
    borderColor: '#10b981',
    points: [
      { lat: 6.9320, lng: 3.6235 },
      { lat: 6.9320, lng: 3.6295 },
      { lat: 6.9265, lng: 3.6295 },
      { lat: 6.9265, lng: 3.6235 },
    ],
  },
];

const STATIC_CCTV = [
  { id: 'CAM-01', name: 'Expressway Tollgate North Cam', lat: 6.9385, lng: 3.6420, agency: 'FRSC / Police' },
  { id: 'CAM-02', name: 'Palace Way Main Gate PTZ', lat: 6.9368, lng: 3.6330, agency: 'Palace Security' },
  { id: 'CAM-03', name: 'Trailer Park South Weighbridge', lat: 6.9366, lng: 3.6344, agency: 'So-Safe Corps' },
  { id: 'CAM-04', name: 'Isale-Ogere Hospital Junction', lat: 6.9325, lng: 3.6310, agency: 'Civil Defence' },
];

const PATROL_UNITS = [
  { id: 'UNIT-04', name: 'NPF Patrol 4 Delta', agency: 'Police', lat: 6.9392, lng: 3.6430, status: 'intercepting', speed: '54 km/h', icon: '🚔' },
  { id: 'VIG-02', name: 'Palace Night Watch 2', agency: 'Vigilante', lat: 6.9355, lng: 3.6325, status: 'patrolling', speed: '22 km/h', icon: '🛡️' },
  { id: 'FRSC-01', name: 'FRSC Rapid Rescue 1', agency: 'FRSC', lat: 6.9410, lng: 3.6450, status: 'standby', speed: '0 km/h', icon: '🚦' },
];

export default function TacticalRadarMap({
  incidents = [],
  activeIncident = null,
  onSelectIncident = () => {},
  breadcrumbs = [],
}) {
  const [zoom, setZoom] = useState(1);
  const [hoveredTarget, setHoveredTarget] = useState(null);
  const [showCctv, setShowCctv] = useState(true);
  const [showUnits, setShowUnits] = useState(true);
  const [showSectors, setShowSectors] = useState(true);

  // Map Width & Height
  const SVG_WIDTH = 900;
  const SVG_HEIGHT = 580;

  // Coordinate Conversion Helper: Lat/Lng -> SVG X/Y
  const toSvgCoords = (lat, lng) => {
    const latNorm = (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat);
    const lngNorm = (lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng);

    const x = Math.max(30, Math.min(SVG_WIDTH - 30, lngNorm * SVG_WIDTH));
    // Invert lat for SVG Y (high lat is top)
    const y = Math.max(30, Math.min(SVG_HEIGHT - 30, (1 - latNorm) * SVG_HEIGHT));

    return { x, y };
  };

  const activeCoord = activeIncident
    ? toSvgCoords(activeIncident.latitude || 6.9388, activeIncident.longitude || 3.6437)
    : null;

  return (
    <div style={{
      background: 'radial-gradient(circle at center, #0d1527 0%, #060b14 70%, #020408 100%)',
      border: '1px solid rgba(201, 150, 58, 0.3)',
      borderRadius: '10px',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 0 40px rgba(16, 185, 129, 0.05)',
    }}>
      {/* Top Map HUD Telemetry Strip */}
      <div style={{
        background: 'rgba(9, 15, 26, 0.92)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0.5rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.6rem',
        fontSize: '0.7rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.2s infinite' }} />
            <span style={{ fontWeight: 900, color: '#86efac', letterSpacing: '0.08em' }}>
              TACTICAL RADAR · GIS SECTOR SWEEP ACTIVE
            </span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
            GRID: 6.9388° N, 3.6437° E · AZ: 042°
          </span>
        </div>

        {/* Map Layers Toggle & Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => setShowSectors(!showSectors)}
            style={{
              background: showSectors ? 'rgba(201, 150, 58, 0.25)' : 'rgba(255,255,255,0.05)',
              border: '1px solid ' + (showSectors ? '#C9963A' : 'rgba(255,255,255,0.2)'),
              color: showSectors ? '#fde047' : '#94a3b8',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.65rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🗺️ Sectors
          </button>
          <button
            onClick={() => setShowUnits(!showUnits)}
            style={{
              background: showUnits ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255,255,255,0.05)',
              border: '1px solid ' + (showUnits ? '#22c55e' : 'rgba(255,255,255,0.2)'),
              color: showUnits ? '#86efac' : '#94a3b8',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.65rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🚔 Patrols ({PATROL_UNITS.length})
          </button>
          <button
            onClick={() => setShowCctv(!showCctv)}
            style={{
              background: showCctv ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.05)',
              border: '1px solid ' + (showCctv ? '#3b82f6' : 'rgba(255,255,255,0.2)'),
              color: showCctv ? '#93c5fd' : '#94a3b8',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.65rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            📹 CCTV ({STATIC_CCTV.length})
          </button>
          <button
            onClick={() => setZoom(z => (z === 1 ? 1.3 : 1))}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.65rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {zoom > 1 ? '🔍 Reset' : '🔍 Zoom'}
          </button>
        </div>
      </div>

      {/* Main SVG Radar Canvas */}
      <div style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${zoom})`,
            transformOrigin: activeCoord ? `${activeCoord.x}px ${activeCoord.y}px` : 'center center',
            transition: 'transform 0.4s ease-out',
          }}
        >
          <defs>
            {/* Radar Circular Sweep Gradient */}
            <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(34, 197, 94, 0.4)" />
              <stop offset="50%" stopColor="rgba(34, 197, 94, 0.1)" />
              <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
            </linearGradient>

            {/* Pulsing Beacon Filters */}
            <filter id="glowRed" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ef4444" />
            </filter>
            <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#22c55e" />
            </filter>
            <filter id="glowGold" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#C9963A" />
            </filter>
          </defs>

          {/* 1. Tactical Grid Lines */}
          <g opacity="0.15" stroke="#38bdf8" strokeWidth="1">
            {[100, 200, 300, 400, 500, 600, 700, 800].map(x => (
              <line key={`gx-${x}`} x1={x} y1="0" x2={x} y2={SVG_HEIGHT} strokeDasharray="4 6" />
            ))}
            {[70, 140, 210, 280, 350, 420, 490].map(y => (
              <line key={`gy-${y}`} x1="0" y1={y} x2={SVG_WIDTH} y2={y} strokeDasharray="4 6" />
            ))}
          </g>

          {/* 2. Concentric Tactical Radar Distance Rings */}
          <g opacity="0.22" stroke="#22c55e" fill="none" strokeWidth="1">
            <circle cx={SVG_WIDTH / 2} cy={SVG_HEIGHT / 2} r="80" strokeDasharray="6 6" />
            <circle cx={SVG_WIDTH / 2} cy={SVG_HEIGHT / 2} r="160" />
            <circle cx={SVG_WIDTH / 2} cy={SVG_HEIGHT / 2} r="240" strokeDasharray="8 8" />
            <circle cx={SVG_WIDTH / 2} cy={SVG_HEIGHT / 2} r="320" />
            {/* Crosshairs */}
            <line x1={SVG_WIDTH / 2} y1="0" x2={SVG_WIDTH / 2} y2={SVG_HEIGHT} stroke="rgba(34,197,94,0.3)" />
            <line x1="0" y1={SVG_HEIGHT / 2} x2={SVG_WIDTH} y2={SVG_HEIGHT / 2} stroke="rgba(34,197,94,0.3)" />
          </g>

          {/* 3. Sector Geofence Polygons */}
          {showSectors && SECTORS_GEO.map(sec => {
            const svgPoints = sec.points
              .map(p => {
                const c = toSvgCoords(p.lat, p.lng);
                return `${c.x},${c.y}`;
              })
              .join(' ');

            return (
              <g key={sec.id}>
                <polygon
                  points={svgPoints}
                  fill={sec.color}
                  stroke={sec.borderColor}
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <text
                  x={toSvgCoords(sec.points[0].lat, sec.points[0].lng).x + 10}
                  y={toSvgCoords(sec.points[0].lat, sec.points[0].lng).y + 16}
                  fill={sec.borderColor}
                  fontSize="9"
                  fontWeight="900"
                  fontFamily="monospace"
                  opacity="0.85"
                >
                  {sec.code}
                </text>
              </g>
            );
          })}

          {/* 4. Live Breadcrumb Path (For active tracking victims) */}
          {breadcrumbs.length > 1 && (
            <polyline
              points={breadcrumbs
                .map(b => {
                  const c = toSvgCoords(b.latitude, b.longitude);
                  return `${c.x},${c.y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#4ade80"
              strokeWidth="2.5"
              strokeDasharray="5 4"
            />
          )}

          {/* 5. CCTV Camera Markers */}
          {showCctv && STATIC_CCTV.map(cam => {
            const pos = toSvgCoords(cam.lat, cam.lng);
            return (
              <g
                key={cam.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredTarget(cam)}
                onMouseLeave={() => setHoveredTarget(null)}
              >
                <circle cx={pos.x} cy={pos.y} r="5" fill="#3b82f6" opacity="0.9" />
                <text x={pos.x + 8} y={pos.y + 4} fill="#93c5fd" fontSize="9" fontWeight="700">
                  📹 {cam.id}
                </text>
              </g>
            );
          })}

          {/* 6. Active Responding Patrol Units */}
          {showUnits && PATROL_UNITS.map(unit => {
            const pos = toSvgCoords(unit.lat, unit.lng);
            return (
              <g
                key={unit.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredTarget(unit)}
                onMouseLeave={() => setHoveredTarget(null)}
              >
                <circle cx={pos.x} cy={pos.y} r="12" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="1.5" />
                <circle cx={pos.x} cy={pos.y} r="4" fill="#22c55e" />
                <text x={pos.x + 15} y={pos.y + 4} fill="#86efac" fontSize="9" fontWeight="800">
                  {unit.icon} {unit.name} ({unit.speed})
                </text>
              </g>
            );
          })}

          {/* 7. Active Incident Pulsing Beacons */}
          {incidents.map(inc => {
            const pos = toSvgCoords(inc.latitude || 6.9388, inc.longitude || 3.6437);
            const isSelected = activeIncident?.id === inc.id;
            const isCodeRed = inc.threat_level === 'CODE_RED' || inc.category?.toLowerCase().includes('robbery') || inc.category?.toLowerCase().includes('terror');
            const isOrange = inc.threat_level === 'CODE_ORANGE';
            const beaconColor = isCodeRed ? '#ef4444' : isOrange ? '#f97316' : '#eab308';
            const filterId = isCodeRed ? 'url(#glowRed)' : 'url(#glowGold)';

            return (
              <g
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                onMouseEnter={() => setHoveredTarget(inc)}
                onMouseLeave={() => setHoveredTarget(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Expanding pulse radar wave */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 26 : 18}
                  fill="none"
                  stroke={beaconColor}
                  strokeWidth="2"
                  opacity="0.75"
                >
                  <animate
                    attributeName="r"
                    values={isSelected ? '16;36;16' : '10;26;10'}
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.9;0.1;0.9"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Core Target Dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 9 : 7}
                  fill={beaconColor}
                  filter={filterId}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {/* Target Label */}
                <text
                  x={pos.x + 12}
                  y={pos.y - 8}
                  fill="#ffffff"
                  fontSize={isSelected ? '11' : '9.5'}
                  fontWeight="900"
                  filter="drop-shadow(0 2px 4px #000)"
                >
                  {inc.id}
                </text>
                <text
                  x={pos.x + 12}
                  y={pos.y + 6}
                  fill={beaconColor}
                  fontSize="8"
                  fontWeight="800"
                >
                  {inc.category?.slice(0, 24)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover / Tooltip HUD Badge */}
        {hoveredTarget && (
          <div style={{
            position: 'absolute',
            bottom: 14,
            left: 14,
            background: 'rgba(9, 15, 26, 0.95)',
            border: '1px solid #C9963A',
            borderRadius: '6px',
            padding: '0.6rem 0.9rem',
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(0,0,0,0.8)',
            maxWidth: '320px',
            fontSize: '0.72rem',
            pointerEvents: 'none',
            zIndex: 10,
          }}>
            <div style={{ fontWeight: 800, color: 'var(--gold)', marginBottom: '2px' }}>
              {hoveredTarget.name || hoveredTarget.id}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
              {hoveredTarget.description || hoveredTarget.category || hoveredTarget.agency}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#86efac', marginTop: '4px', fontFamily: 'monospace' }}>
              LAT: {hoveredTarget.latitude || hoveredTarget.lat} · LNG: {hoveredTarget.longitude || hoveredTarget.lng}
            </div>
          </div>
        )}
      </div>

      {/* Bottom GIS Coordinates & Status Footer */}
      <div style={{
        background: 'rgba(6, 11, 20, 0.95)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.4rem 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.65rem',
        color: 'rgba(245, 237, 216, 0.7)',
      }}>
        <div>
          <span>POLICE & VIGILANTE SECTOR RADAR · </span>
          <span style={{ color: '#22c55e', fontWeight: 800 }}>REMO COMMAND SECURE SATELLITE FEED</span>
        </div>
        <div style={{ fontFamily: 'monospace', color: '#94a3b8' }}>
          CLICK PIN TO INSPECT & DISPATCH UNIT
        </div>
      </div>
    </div>
  );
}
