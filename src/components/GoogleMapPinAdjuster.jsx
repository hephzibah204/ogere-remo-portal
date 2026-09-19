import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
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

// Custom Pin DivIcon with pulse effect and clean crisp rendering without broken images
function createPinIcon(color = '#ef4444', iconChar = '📍') {
  return L.divIcon({
    className: 'ogere-interactive-pin',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        cursor: grab;
      ">
        <div style="
          position: absolute;
          width: 32px;
          height: 32px;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.6);
        "></div>
        <span style="
          position: relative;
          z-index: 2;
          font-size: 15px;
          line-height: 1;
          margin-bottom: 4px;
        ">${iconChar}</span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
}

// Controller to programmatic center/flyTo map
function MapFlyController({ center, zoom = 18 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.0 });
    }
  }, [center, zoom, map]);
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
  pinColor = '#ef4444',
  pinIconChar = '📍',
  height = '280px',
  compact = false,
}) {
  const [coords, setCoords] = useState({
    lat: Number(initialLat) || 6.9388,
    lng: Number(initialLng) || 3.6437,
  });
  const [mapType, setMapType] = useState('hybrid'); // 'hybrid' (Satellite + Roads) or 'roadmap' (Street)
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [addressData, setAddressData] = useState(null);
  const [statusNotice, setStatusNotice] = useState('');
  const debounceTimerRef = useRef(null);

  // Sync coords if initial props change
  useEffect(() => {
    if (initialLat && initialLng) {
      const latNum = Number(initialLat);
      const lngNum = Number(initialLng);
      if (!isNaN(latNum) && !isNaN(lngNum) && (latNum !== coords.lat || lngNum !== coords.lng)) {
        setCoords({ lat: latNum, lng: lngNum });
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
      setStatusNotice(isUserAdjusted ? '🎯 Pin Adjusted by User' : '📍 Location Acquired');
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
    resolveLocation(latlng.lat, latlng.lng, true);
  };

  // Handle click on map
  const handleMapClick = (lat, lng) => {
    setCoords({ lat, lng });
    resolveLocation(lat, lng, true);
  };

  // Nudge micro-adjustment (approx 9 meters per step)
  const handleNudge = (dLat, dLng) => {
    const newLat = Number((coords.lat + dLat).toFixed(6));
    const newLng = Number((coords.lng + dLng).toFixed(6));
    setCoords({ lat: newLat, lng: newLng });
    resolveLocation(newLat, newLng, true);
  };

  // Snap to live hardware GPS
  const handleLocateMe = async () => {
    setIsLocating(true);
    setStatusNotice('Acquiring real-time GPS satellites...');
    try {
      const fix = await acquirePreciseGpsLocation({ timeoutMs: 6000, targetAccuracyMeters: 20 });
      setCoords({ lat: fix.latitude, lng: fix.longitude });
      await resolveLocation(fix.latitude, fix.longitude, false);
      setStatusNotice(`✅ Locked: ±${Math.round(fix.accuracy || 15)}m accuracy`);
      setTimeout(() => setStatusNotice(''), 4000);
    } catch (err) {
      console.warn('Locate me error:', err);
      setStatusNotice('⚠️ Could not acquire GPS; keep current pin.');
      setTimeout(() => setStatusNotice(''), 4000);
    } finally {
      setIsLocating(false);
    }
  };

  // Quick jump to major Ogere landmark anchor
  const handleJumpLandmark = (lm) => {
    setCoords({ lat: lm.lat, lng: lm.lng });
    resolveLocation(lm.lat, lm.lng, true);
  };

  // Tile layer configuration (Google Roadmap vs Google Hybrid Satellite)
  const tileUrl = mapType === 'hybrid'
    ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' // Google Hybrid (Satellite + Road Labels)
    : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'; // Google Standard Roadmap

  return (
    <div style={{
      background: '#0b1324',
      border: '1.5px solid rgba(56, 189, 248, 0.35)',
      borderRadius: '10px',
      overflow: 'hidden',
      marginTop: '8px',
      marginBottom: '10px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
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
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f8fafc' }}>
            {title}
          </span>
          {statusNotice && (
            <span style={{ fontSize: '0.6rem', color: '#38bdf8', fontWeight: 700 }}>
              {statusNotice}
            </span>
          )}
        </div>

        {/* Map Type Switcher & Locate GPS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            style={{
              background: isLocating ? 'rgba(56,189,248,0.3)' : 'rgba(56,189,248,0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56,189,248,0.4)',
              padding: '3px 7px',
              borderRadius: '4px',
              fontSize: '0.62rem',
              fontWeight: 800,
              cursor: isLocating ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <span>🎯</span>
            <span>{isLocating ? 'Acquiring...' : 'My GPS'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMapType(prev => prev === 'hybrid' ? 'roadmap' : 'hybrid')}
            style={{
              background: mapType === 'hybrid' ? '#1e293b' : '#334155',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '3px 7px',
              borderRadius: '4px',
              fontSize: '0.62rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {mapType === 'hybrid' ? '🛰️ Satellite' : '🗺️ Street'}
          </button>
        </div>
      </div>

      {/* Interactive Map Viewport */}
      <div style={{ height, width: '100%', position: 'relative' }}>
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={17}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url={tileUrl}
            attribution='&copy; Google Maps / OpenStreetMap'
            maxZoom={20}
          />
          <MapFlyController center={[coords.lat, coords.lng]} zoom={18} />
          <MapClickEvents onMapClick={handleMapClick} />
          <Marker
            position={[coords.lat, coords.lng]}
            icon={createPinIcon(pinColor, pinIconChar)}
            draggable={true}
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
          />
        </MapContainer>

        {/* Drag Instruction Overlay */}
        <div style={{
          position: 'absolute',
          top: '6px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.88)',
          color: '#e2e8f0',
          padding: '2px 8px',
          borderRadius: '20px',
          fontSize: '0.58rem',
          fontWeight: 700,
          pointerEvents: 'none',
          zIndex: 1000,
          border: '1px solid rgba(255,255,255,0.15)',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
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
            <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>
              📍 Current Pinpoint Location
            </span>
            <span style={{ fontSize: '0.55rem', color: '#38bdf8', fontFamily: 'monospace' }}>
              {coords.lat.toFixed(5)}°N, {coords.lng.toFixed(5)}°E
            </span>
          </div>

          <div style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            color: '#f8fafc',
            lineHeight: 1.3,
          }}>
            {isGeocoding ? 'Resolving street address & sector...' : (addressData?.fullAddress || 'Locating exact Ogere address...')}
          </div>

          {addressData?.nearestLandmark && (
            <div style={{ fontSize: '0.64rem', color: '#4ade80', fontWeight: 700, marginTop: '2px' }}>
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
              fontSize: '0.62rem',
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
