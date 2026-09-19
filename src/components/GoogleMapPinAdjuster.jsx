import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  reverseGeocodeLocation,
  acquirePreciseGpsLocation,
  getStandardMapUrls,
} from '../services/liveLocationEngine';
import {
  OGERE_LANDMARKS,
  isInsideOgere,
  resolveOgereLocation,
} from '../services/ogereGeoEngine';

// Global CSS fix for Leaflet divIcon to ensure no white boxes or broken backgrounds
const PIN_STYLE_ID = 'ogere-leaflet-pin-styles';
if (typeof document !== 'undefined' && !document.getElementById(PIN_STYLE_ID)) {
  const styleEl = document.createElement('style');
  styleEl.id = PIN_STYLE_ID;
  styleEl.textContent = `
    .ogere-interactive-svg-pin,
    .leaflet-div-icon.ogere-interactive-svg-pin {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }
    @keyframes ogere-pulse-ring {
      0% { transform: scale(0.85); opacity: 0.8; }
      50% { transform: scale(1.15); opacity: 0.3; }
      100% { transform: scale(0.85); opacity: 0.8; }
    }
    .ogere-pulse-halo {
      animation: ogere-pulse-ring 2.5s infinite ease-in-out;
    }
  `;
  document.head.appendChild(styleEl);
}

// Crisp High-Contrast SVG Teardrop Pin that CANNOT fail to render
function createPinIcon(color = '#ef4444', iconChar = '📍') {
  return L.divIcon({
    className: 'ogere-interactive-svg-pin',
    html: `
      <div style="
        position: relative;
        width: 46px;
        height: 56px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        cursor: grab;
      ">
        <svg width="46" height="56" viewBox="0 0 46 56" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 6px 10px rgba(0,0,0,0.7));">
          <!-- Ground Shadow -->
          <ellipse cx="23" cy="53" rx="14" ry="3" fill="rgba(0,0,0,0.5)"/>
          <!-- Teardrop Pin Body -->
          <path d="M23 2C12 2 3 11 3 22C3 36 21.2 51.5 22.1 52.3C22.6 52.7 23.4 52.7 23.9 52.3C24.8 51.5 43 36 43 22C43 11 34 2 23 2Z" fill="${color}" stroke="#ffffff" stroke-width="2.5"/>
          <!-- Inner Contrast Circle -->
          <circle cx="23" cy="21" r="13.5" fill="#ffffff"/>
          <!-- Center Emblem -->
          <text x="23" y="26" text-anchor="middle" font-size="15" font-family="system-ui, -apple-system, sans-serif" dominant-baseline="central">${iconChar}</text>
        </svg>
      </div>
    `,
    iconSize: [46, 56],
    iconAnchor: [23, 54],
    popupAnchor: [0, -54],
  });
}

// Controller to guarantee map size calculation and smooth panning
function MapLifecycleController({ lat, lng, zoom = 18, triggerFly = 0 }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);

  useEffect(() => {
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      map.invalidateSize();
      map.flyTo([lat, lng], zoom, { duration: 0.8 });
    }
  }, [lat, lng, zoom, triggerFly, map]);

  return null;
}

// Map Click to drop or adjust pin
function MapClickEvents({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (typeof onMapClick === 'function') {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function GoogleMapPinAdjuster({
  initialLat = 6.9388,
  initialLng = 3.6437,
  onLocationChange = null,
  title = 'Adjust Exact Pin on Google Map',
  pinColor = '#0284c7',
  pinIconChar = '📍',
  height = '280px',
  compact = false,
  autoLocate = false,
}) {
  const [coords, setCoords] = useState({
    lat: Number(initialLat) || 6.9388,
    lng: Number(initialLng) || 3.6437,
  });
  const [accuracyRadius, setAccuracyRadius] = useState(25);
  const [triggerFly, setTriggerFly] = useState(0);
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' (Street Map View) by default
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [addressData, setAddressData] = useState(null);
  const [statusNotice, setStatusNotice] = useState('');
  const debounceTimerRef = useRef(null);
  const hasAutoLocatedRef = useRef(false);

  // Sync coords if initial props change externally
  useEffect(() => {
    if (initialLat && initialLng) {
      const latNum = Number(initialLat);
      const lngNum = Number(initialLng);
      if (!isNaN(latNum) && !isNaN(lngNum) && (latNum !== coords.lat || lngNum !== coords.lng)) {
        setCoords({ lat: latNum, lng: lngNum });
        setTriggerFly((c) => c + 1);
      }
    }
  }, [initialLat, initialLng]);

  // Reverse geocode when coords update
  const resolveLocation = async (lat, lng, isUserAdjusted = false) => {
    setIsGeocoding(true);
    try {
      const rev = await reverseGeocodeLocation(lat, lng);
      const ogere = resolveOgereLocation(lat, lng);
      const inside = isInsideOgere(lat, lng);

      let formattedAddress = rev.fullAddress;
      if (inside) {
        if (rev.nearestLandmark && !formattedAddress.includes(rev.nearestLandmark)) {
          formattedAddress = `${rev.nearestLandmark}, ${rev.sector || 'Ogere Remo'}`;
        }
      }

      const res = {
        lat,
        lng,
        fullAddress: formattedAddress,
        nearestLandmark: rev.nearestLandmark || ogere.landmark,
        sector: rev.sector || ogere.sector,
        isInsideOgere: inside,
        directionsUrl: rev.directionsUrl,
        googleMapsUrl: rev.googleMapsUrl,
        satelliteMapsUrl: rev.satelliteMapsUrl,
        isUserAdjusted,
      };

      setAddressData(res);
      if (typeof onLocationChange === 'function') {
        onLocationChange(res);
      }
      setStatusNotice(isUserAdjusted ? '🎯 Pin Dropped & Adjusted' : '📍 Location Centered');
      setTimeout(() => setStatusNotice(''), 4000);
    } catch (err) {
      console.warn('Geocoding error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Run on mount or when coords change
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      resolveLocation(coords.lat, coords.lng, false);
    }, 350);
    return () => clearTimeout(debounceTimerRef.current);
  }, [coords.lat, coords.lng]);

  // Handle pin drag end
  const handleMarkerDragEnd = (e) => {
    const latlng = e.target.getLatLng();
    setCoords({ lat: latlng.lat, lng: latlng.lng });
    setTriggerFly((c) => c + 1);
    resolveLocation(latlng.lat, latlng.lng, true);
  };

  // Handle click on map
  const handleMapClick = (lat, lng) => {
    setCoords({ lat, lng });
    setTriggerFly((c) => c + 1);
    resolveLocation(lat, lng, true);
  };

  // Nudge micro-adjustment (approx 9 meters per step)
  const handleNudge = (dLat, dLng) => {
    const newLat = Number((coords.lat + dLat).toFixed(6));
    const newLng = Number((coords.lng + dLng).toFixed(6));
    setCoords({ lat: newLat, lng: newLng });
    setTriggerFly((c) => c + 1);
    resolveLocation(newLat, newLng, true);
  };

  // Snap to live hardware GPS & re-center map smoothly
  const handleLocateMe = async () => {
    setIsLocating(true);
    setStatusNotice('📡 Contacting GPS Satellites & Centering...');
    try {
      const fix = await acquirePreciseGpsLocation({ timeoutMs: 6000, targetAccuracyMeters: 20 });
      const newLat = Number(fix.latitude);
      const newLng = Number(fix.longitude);
      setCoords({ lat: newLat, lng: newLng });
      setAccuracyRadius(Math.max(15, Math.round(fix.accuracy || 20)));
      setTriggerFly((c) => c + 1);
      await resolveLocation(newLat, newLng, false);
      setStatusNotice(`✅ Located: ±${Math.round(fix.accuracy || 15)}m Sat Lock`);
      setTimeout(() => setStatusNotice(''), 5000);
    } catch (err) {
      console.warn('Locate me error:', err);
      setStatusNotice('⚠️ Could not acquire GPS; keep current pin.');
      setTimeout(() => setStatusNotice(''), 4000);
    } finally {
      setIsLocating(false);
    }
  };

  // Auto-locate once on mount if enabled
  useEffect(() => {
    if (autoLocate && !hasAutoLocatedRef.current) {
      hasAutoLocatedRef.current = true;
      handleLocateMe();
    }
  }, [autoLocate]);

  // Quick jump to major Ogere landmark anchor
  const handleJumpLandmark = (lm) => {
    setCoords({ lat: lm.lat, lng: lm.lng });
    setTriggerFly((c) => c + 1);
    resolveLocation(lm.lat, lm.lng, true);
  };

  // Tile layer configuration (Google Roadmap vs Google Hybrid Satellite)
  const tileUrl = mapType === 'hybrid'
    ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' // Google Hybrid (Satellite + Road Labels)
    : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'; // Google Standard Roadmap

  return (
    <div style={{
      background: '#0b1324',
      border: '1.5px solid rgba(56, 189, 248, 0.4)',
      borderRadius: '12px',
      overflow: 'hidden',
      marginTop: '8px',
      marginBottom: '10px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      fontFamily: 'inherit',
    }}>
      {/* Top Header & View Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 10px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        flexWrap: 'wrap',
        gap: '6px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '1rem' }}>🗺️</span>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f8fafc' }}>
            {title}
          </span>
          {statusNotice && (
            <span style={{ fontSize: '0.62rem', color: '#38bdf8', fontWeight: 800 }}>
              {statusNotice}
            </span>
          )}
        </div>

        {/* Action Buttons: Auto-Find Location & Map Style */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: '1px solid #60a5fa',
              padding: '4px 9px',
              borderRadius: '6px',
              fontSize: '0.66rem',
              fontWeight: 800,
              cursor: isLocating ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)',
            }}
          >
            <span>🎯</span>
            <span>{isLocating ? 'Locating...' : 'Auto-Find My Location'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMapType(prev => prev === 'hybrid' ? 'roadmap' : 'hybrid')}
            style={{
              background: mapType === 'hybrid' ? '#1e293b' : '#334155',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.64rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {mapType === 'roadmap' ? '🗺️ Street View' : '🛰️ Satellite'}
          </button>
        </div>
      </div>

      {/* Interactive Map Viewport */}
      <div style={{ height, width: '100%', position: 'relative' }}>
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={18}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url={tileUrl}
            attribution='&copy; Google Maps / OpenStreetMap'
            maxZoom={20}
          />
          <MapLifecycleController lat={coords.lat} lng={coords.lng} zoom={18} triggerFly={triggerFly} />
          <MapClickEvents onMapClick={handleMapClick} />

          {/* Pulsing GPS Accuracy Halo Circle */}
          <Circle
            center={[coords.lat, coords.lng]}
            radius={accuracyRadius}
            pathOptions={{
              color: '#0284c7',
              fillColor: '#38bdf8',
              fillOpacity: 0.2,
              weight: 1.5,
              dashArray: '4, 4',
            }}
          />

          {/* Crisp SVG Location Pin */}
          <Marker
            position={[coords.lat, coords.lng]}
            icon={createPinIcon(pinColor, pinIconChar)}
            draggable={true}
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
          />
        </MapContainer>

        {/* Floating Google Maps-Style "Locate Me" Button */}
        <button
          type="button"
          title="Snap to My Exact Location"
          onClick={handleLocateMe}
          disabled={isLocating}
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            zIndex: 1000,
            background: '#ffffff',
            color: '#0284c7',
            border: '2px solid #0284c7',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            cursor: isLocating ? 'wait' : 'pointer',
          }}
        >
          {isLocating ? '⏳' : '🎯'}
        </button>

        {/* Drag Instruction Overlay */}
        <div style={{
          position: 'absolute',
          top: '6px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.9)',
          color: '#e2e8f0',
          padding: '2px 10px',
          borderRadius: '20px',
          fontSize: '0.6rem',
          fontWeight: 700,
          pointerEvents: 'none',
          zIndex: 1000,
          border: '1px solid rgba(255,255,255,0.2)',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
        }}>
          💡 Tap map or drag pin to adjust exact doorstep
        </div>

        {/* Nudge Micro-Adjustment D-Pad */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          padding: '4px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 22px)',
          gap: '2px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
        }}>
          <div></div>
          <button
            type="button"
            title="Nudge North"
            onClick={() => handleNudge(0.0001, 0)}
            style={{ width: '22px', height: '22px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ⬆️
          </button>
          <div></div>

          <button
            type="button"
            title="Nudge West"
            onClick={() => handleNudge(0, -0.0001)}
            style={{ width: '22px', height: '22px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ⬅️
          </button>
          <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: '#94a3b8' }}>
            🎯
          </div>
          <button
            type="button"
            title="Nudge East"
            onClick={() => handleNudge(0, 0.0001)}
            style={{ width: '22px', height: '22px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ➡️
          </button>

          <div></div>
          <button
            type="button"
            title="Nudge South"
            onClick={() => handleNudge(-0.0001, 0)}
            style={{ width: '22px', height: '22px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ⬇️
          </button>
          <div></div>
        </div>
      </div>

      {/* Resolved Location Banner & Quick Landmark Anchors */}
      <div style={{
        padding: '8px 10px',
        background: '#090e1a',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Real-time Address Card */}
        <div style={{ marginBottom: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>
              📍 Current Pinpoint Location
            </span>
            <span style={{ fontSize: '0.58rem', color: '#38bdf8', fontFamily: 'monospace' }}>
              {coords.lat.toFixed(5)}°N, {coords.lng.toFixed(5)}°E
            </span>
          </div>

          <div style={{
            fontSize: '0.76rem',
            fontWeight: 800,
            color: '#f8fafc',
            lineHeight: 1.3,
          }}>
            {isGeocoding ? 'Resolving street address & sector...' : (addressData?.fullAddress || 'Locating exact Ogere address...')}
          </div>

          {addressData?.nearestLandmark && (
            <div style={{ fontSize: '0.66rem', color: '#4ade80', fontWeight: 700, marginTop: '2px' }}>
              🏛️ Landmark: {addressData.nearestLandmark} {addressData.sector ? `· ${addressData.sector}` : ''}
            </div>
          )}
        </div>

        {/* Quick Jump Landmark Chips */}
        <div style={{ marginTop: '6px' }}>
          <div style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '3px' }}>
            Quick Snap to Ogere Landmark:
          </div>
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
            {OGERE_LANDMARKS.slice(0, 6).map((lm) => (
              <button
                key={lm.id}
                type="button"
                onClick={() => handleJumpLandmark(lm)}
                style={{
                  whiteSpace: 'nowrap',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  padding: '2px 7px',
                  fontSize: '0.58rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {lm.name.split('/')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* External Google Maps Nav Link */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.64rem',
              color: '#38bdf8',
              textDecoration: 'none',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>↗️</span>
            <span>Open in Google Maps App</span>
          </a>
        </div>
      </div>
    </div>
  );
}
