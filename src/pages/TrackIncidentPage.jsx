import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function TrackIncidentPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLiveTrack = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/live-location?incidentId=${encodeURIComponent(id)}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date().toLocaleTimeString());
        setError(null);
      } else {
        setError('Incident tracking session not found or has expired.');
      }
    } catch (err) {
      setError('Connection interrupted. Retrying live radar stream...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTrack();
    const interval = setInterval(fetchLiveTrack, 3500); // High-frequency 3.5s polling for family
    return () => clearInterval(interval);
  }, [id]);

  const inc = data?.incident;
  const breadcrumbs = data?.breadcrumbs || [];

  return (
    <div style={{ background: '#090403', minHeight: '100vh', color: '#f5edd8', padding: '1.5rem 1rem' }}>
      <SEO
        title={`Live Radar Tracking — ${id || 'Emergency Interception'}`}
        description="Public guardian radar viewer for live emergency tracking in Ogere Remo Kingdom."
      />

      {/* Top Header */}
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', padding: '0.4rem 1rem', borderRadius: '20px', marginBottom: '0.8rem' }}>
          <span style={{ fontSize: '1.1rem', animation: 'pulse 1s infinite' }}>🚨</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#fca5a5', letterSpacing: '0.08em' }}>
            OGERE REMO SECURITY COMMAND · GUARDIAN RADAR
          </span>
        </div>
        <h1 className="cinzel" style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '0.2rem 0' }}>
          Live Emergency Interception Radar
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
          Tracking Session ID: <strong style={{ color: 'var(--gold)' }}>{id}</strong>
        </p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {loading && !data ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gold)' }}>
            📡 Connecting to Ogere Police & Vigilante Live Radar Satellite...
          </div>
        ) : error && !data ? (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>{error}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
              If you are in immediate danger, please dial Ogere Police DPO directly: <strong style={{ color: '#86efac' }}>08081762371</strong>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {/* Live Status Card */}
            <div style={{
              background: inc?.is_live_tracking ? 'rgba(5, 46, 22, 0.7)' : 'rgba(20, 15, 12, 0.9)',
              border: inc?.is_live_tracking ? '2px solid #22c55e' : '1px solid var(--gold)',
              borderRadius: '8px',
              padding: '1.2rem',
              boxShadow: inc?.is_live_tracking ? '0 0 20px rgba(34,197,94,0.3)' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{inc?.is_live_tracking ? '🟢' : '⚪'}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: inc?.is_live_tracking ? '#4ade80' : 'var(--gold)' }}>
                    {inc?.is_live_tracking ? 'REAL-TIME LIVE MOVEMENT RADAR' : 'STATIC LAST KNOWN POSITION'}
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
                  Auto-updated: {lastUpdated || 'Active'}
                </span>
              </div>

              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem', marginBottom: '0.8rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.6rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.6)' }}>SPEED</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>
                    {inc?.speed ? `${inc.speed} km/h` : 'Stationary'}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.6rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.6)' }}>HEADING</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>
                    {inc?.heading ? `${Math.round(inc.heading)}°` : 'Tracked'}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.6rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.6)' }}>RESPONDING UNIT</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#86efac' }}>
                    {inc?.responding_unit || inc?.assigned_agency || 'Police En Route'}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.6rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.6)' }}>STATUS</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fde047', textTransform: 'uppercase' }}>
                    ● {inc?.status || 'Active'}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#ffffff', lineHeight: 1.5 }}>
                📍 Sector: <strong>{inc?.location}</strong>
              </div>
            </div>

            {/* Embedded Google Map */}
            {inc?.latitude && inc?.longitude && (
              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--gold)' }}>
                <iframe
                  title="live-tracking-map"
                  width="100%"
                  height="340"
                  frameBorder="0"
                  style={{ display: 'block' }}
                  src={`https://maps.google.com/maps?q=${inc.latitude},${inc.longitude}&z=17&output=embed`}
                  allowFullScreen
                />
                <div style={{ background: '#120a07', padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
                    Coordinates: {Number(inc.latitude).toFixed(5)}°N, {Number(inc.longitude).toFixed(5)}°E
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${inc.latitude},${inc.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                    }}
                  >
                    Open Live Navigation in Google Maps ➔
                  </a>
                </div>
              </div>
            )}

            {/* Movement Breadcrumb History */}
            {breadcrumbs.length > 0 && (
              <div style={{ background: '#120a07', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '0.5rem' }}>
                  📍 Route History Trail ({breadcrumbs.length} Recorded Waypoints)
                </div>
                <div style={{ maxHeight: '120px', overflowY: 'auto', fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                  {breadcrumbs.slice(-10).reverse().map((b, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span>Point #{breadcrumbs.length - idx}: {Number(b.latitude).toFixed(5)}°N, {Number(b.longitude).toFixed(5)}°E</span>
                      <span style={{ color: '#86efac' }}>{b.speed ? `${b.speed} km/h` : ''} · {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Hotlines Call Action */}
            <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#ffffff' }}>Direct Incident Hotline</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>Speak immediately with Ogere Police DPO & Patrol Command</div>
              </div>
              <a
                href="tel:08081762371"
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                }}
              >
                📞 Call DPO: 08081762371
              </a>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/" style={{ color: 'var(--gold)', fontSize: '0.8rem', textDecoration: 'none' }}>
                ← Return to Ogere Remo Civic Portal
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
