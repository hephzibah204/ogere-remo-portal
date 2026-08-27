import { useState, useMemo } from 'react';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';
import { MAP_LOCATIONS, CAT_COLORS } from '../data/mapLocations';

const KEY_PLACES = [
  {
    id: 'palace',
    name: 'Aafin Ologere Palace & Royal Court',
    cat: 'Heritage',
    icon: '👑',
    color: '#C9963A',
    address: 'Palace Way, Oke-Ogere, Ogere Remo, Ogun State',
    lat: 6.9368,
    lng: 3.6330,
    zoom: 17,
    note: 'The historic seat of HRH Oba James Obafemi Saliu (Kankanbiina II), the Ologere of Ogere Remo. Houses the royal archives, ancestral shrines, and chieftaincy hall.',
    hours: 'Palace Secretariat: Mon–Fri 9 AM – 5 PM',
    phone: '+234 803 451 2345',
    googleQuery: 'Ologere+Palace+Ogere+Remo+Ogun+State',
    highlight: 'Royal Seat & Palace Grounds',
  },
  {
    id: 'townhall',
    name: 'Ogere Town Hall & Civic Centre (OCDA HQ)',
    cat: 'Governance',
    icon: '🏛️',
    color: '#2D4A22',
    address: 'WJPJ+GP4, Town Centre, Ogere Remo 121107',
    lat: 6.9363,
    lng: 3.6318,
    zoom: 17,
    note: 'Headquarters of the Ogere Community Development Association (OCDA). Community meetings, public hearings, and cultural events take place here.',
    hours: 'Mon–Sat: 8 AM – 6 PM',
    phone: '+234 912 725 6487',
    rating: '3.7★ (15 reviews)',
    googleQuery: 'Ogere+Town+Hall+Ogun+State',
    highlight: 'Community Parliament',
  },
  {
    id: 'resort',
    name: 'Ogere Resort & International Convention Centre',
    cat: 'Hospitality',
    icon: '🏨',
    color: '#B5451B',
    address: 'KM 67, Lagos–Ibadan Expressway, Ogere 121107',
    lat: 6.9388,
    lng: 3.6437,
    zoom: 16,
    note: "West Africa's premier retreat and hospitality destination with over 140 luxury chalets, conference amphitheatres, swimming pools, and landscaped golf tracks.",
    hours: '24 Hours / Daily',
    phone: '+234 906 247 0474',
    rating: '4.4★ (558 reviews)',
    website: 'https://ogereresort.com',
    googleQuery: 'Ogere+Resort+Lagos+Ibadan+Expressway',
    highlight: 'Premier Hospitality Destination',
  },
  {
    id: 'market',
    name: 'Ogere Central Market & Oja Ale',
    cat: 'Commerce',
    icon: '🛖',
    color: '#8B6914',
    address: 'Market Road, Ogere Remo 121107, Ogun State',
    lat: 6.9354,
    lng: 3.6338,
    zoom: 17,
    note: 'The 600-year-old commercial heart of Ogereland. Known for daily farm-fresh harvests (Ogere yams, palm oil, plantains) and traditional night trading.',
    hours: 'Daily: 6:00 AM – 10:00 PM',
    phone: '+234 704 957 0510',
    rating: '4.4★ (8 reviews)',
    googleQuery: 'Ogere+Central+Market+Ogun+State',
    highlight: 'Historic Trade Centre',
  },
  {
    id: 'aladura',
    name: 'The Church of the Lord (Aladura) Worldwide HQ',
    cat: 'Heritage',
    icon: '⛪',
    color: '#1a2e5e',
    address: 'WJPR+9QQ, Lisa Quarter, Ogere Remo 121107',
    lat: 6.9360,
    lng: 3.6420,
    zoom: 17,
    note: 'Global headquarters and birthplace of the indigenous Christian movement founded on July 27, 1930 by Prophet Josiah Olunowo Ositelu.',
    hours: 'Open for pilgrimage and worship',
    rating: '4.1★ (32 reviews)',
    website: 'https://tclpfw.org',
    googleQuery: 'The+Church+of+the+Lord+Aladura+Ogere+Remo',
    highlight: 'Global Spiritual Heritage',
  },
  {
    id: 'college',
    name: 'Ositelu Memorial College (OMCOOSA)',
    cat: 'Education',
    icon: '🏫',
    color: '#1a2e5e',
    address: 'Awomosu Agbato Drive, Ogere Remo 121107',
    lat: 6.9405,
    lng: 3.6397,
    zoom: 16,
    note: 'The premier secondary educational institution of Ogere Remo, producing generations of distinguished global alumni, scientists, and public leaders.',
    hours: 'Mon–Fri: 8:00 AM – 4:30 PM',
    phone: '+234 806 215 8840',
    googleQuery: 'Ositelu+Memorial+College+Ogere',
    highlight: 'Educational Beacon',
  },
  {
    id: 'health',
    name: 'Ogere Primary Health Centre & Maternity',
    cat: 'Emergency',
    icon: '🏥',
    color: '#dc2626',
    address: 'Health Centre Road, Ogere Remo, Ogun State',
    lat: 6.9350,
    lng: 3.6340,
    zoom: 17,
    note: '24-hour public healthcare facility offering outpatient diagnostics, immunization, prenatal maternity care, and emergency first response.',
    hours: '24 Hours Emergency Response',
    phone: '+234 802 345 6789',
    googleQuery: 'Ogere+Primary+Health+Centre+Ogun+State',
    highlight: 'Community Health Facility',
  },
  {
    id: 'police',
    name: 'Ogere Police Divisional Headquarters',
    cat: 'Emergency',
    icon: '🚔',
    color: '#dc2626',
    address: 'WJMP+W64, Station Road, Ogere Remo 121107',
    lat: 6.9348,
    lng: 3.6356,
    zoom: 17,
    note: 'Ogun State Police Command division ensuring community safety along town quarters and the expressway corridor. DPO Direct Line: 08081762371.',
    hours: '24 Hours Emergency Patrol',
    phone: '+234 705 459 9009',
    googleQuery: 'Ogere+Police+Station+Ogun+State',
    highlight: 'Security Command',
  },
  {
    id: 'hills',
    name: 'Agbele Heights & Ancient Defensive Hills',
    cat: 'Heritage',
    icon: '🌿',
    color: '#059669',
    address: 'Agbele Ridge, Ogere Remo North Axis',
    lat: 6.9440,
    lng: 3.6480,
    zoom: 15,
    note: 'The high-altitude geological hills that served as natural fortress, ancient lookout post, and farmland for founding warrior prince Olipakala in 1401 A.D.',
    hours: 'Open for eco-tourism & hiking',
    googleQuery: 'Agbele+Ogere+Remo+Ogun+State',
    highlight: 'Ancestral Citadel & Viewpoint',
  },
  {
    id: 'trailer',
    name: 'Ogere Logistics & Interchange Corridor',
    cat: 'Transport',
    icon: '🚛',
    color: '#5C3317',
    address: 'WJPM+JQP, Lagos–Ibadan Expressway Axis, Ogere',
    lat: 6.9366,
    lng: 3.6344,
    zoom: 16,
    note: 'Key transport node connecting Ogun State, Lagos, and the Northern commerce corridors across Nigeria.',
    hours: '24 Hours',
    phone: '+234 912 413 0304',
    rating: '3.7★ (106 reviews)',
    googleQuery: 'Ogere+Remo+Interchange+Ogun+State',
    highlight: 'Regional Commerce Hub',
  },
];

const CATEGORIES = ['All', 'Heritage', 'Governance', 'Hospitality', 'Commerce', 'Education', 'Emergency', 'Transport'];

export default function MapPage() {
  const [selectedPlace, setSelectedPlace] = useState(KEY_PLACES[0]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [mapType, setMapType] = useState('m'); // 'm' for Roadmap, 'k' for Satellite

  const filteredPlaces = useMemo(() => {
    return KEY_PLACES.filter(p => {
      if (filter !== 'All' && p.cat !== filter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.note.toLowerCase().includes(q) ||
          p.cat.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [filter, search]);

  // Construct dynamic Google Maps iframe URL with embed parameter
  const getGoogleMapsUrl = () => {
    if (!selectedPlace) {
      return `https://maps.google.com/maps?q=Ogere+Remo,+Ogun+State,+Nigeria&t=${mapType}&z=14&ie=UTF8&iwloc=&output=embed`;
    }
    const query = selectedPlace.googleQuery || encodeURIComponent(`${selectedPlace.name}, Ogere Remo`);
    return `https://maps.google.com/maps?q=${query}&t=${mapType}&z=${selectedPlace.zoom || 16}&ie=UTF8&iwloc=&output=embed`;
  };

  const getDirectDirectionsUrl = (place) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${place.name}, Ogere Remo, Ogun State, Nigeria`)}`;
  };

  return (
    <div>
      <SEO
        title="Interactive Google Map & Landmarks"
        description="Explore Ogere Remo on Google Maps — find Aafin Ologere Palace, Ogere Resort, Central Market, schools, health facilities, and historic landmarks."
      />
      <Hero
        ey="Geography & Landmarks"
        ti="Ogere Remo on Google Maps"
        sub="Interactive high-resolution Google Maps exploration highlighting the palaces, institutions, markets, and heritage citadels of Ogereland."
        dark
      />

      <div style={{ background: 'linear-gradient(90deg, #1a0d06, #2c1500, #1a0d06)', padding: '0.65rem 2rem', textAlign: 'center', borderBottom: '1px solid rgba(201,150,58,0.2)' }}>
        <span className="cinzel" style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: 'rgba(245,237,216,0.8)', textTransform: 'uppercase' }}>
          📍 OGERE REMO · IKENNE LOCAL GOVERNMENT AREA · 6°47′N, 3°34′E · ELEVATION 94M
        </span>
      </div>

      <Section bg="#0d0704" py="3rem">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Filter and Search Bar */}
          <div
            className="glass"
            style={{
              padding: '1.2rem 1.5rem',
              borderRadius: '14px',
              marginBottom: '2rem',
              border: '1px solid rgba(201,150,58,0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Search bar */}
              <div style={{ flex: 1, minWidth: 'min(260px, 100%)', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                <input
                  className="inp"
                  style={{ paddingLeft: '2.5rem', borderRadius: '30px' }}
                  placeholder="Search key places, palace, resort, market, schools..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Map View Toggle (Roadmap vs Satellite) */}
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>VIEW:</span>
                <button
                  onClick={() => setMapType('m')}
                  className={`abtn ${mapType === 'm' ? 'abtn-p' : 'abtn-o'}`}
                  style={{ fontSize: '0.55rem', padding: '0.4rem 0.8rem', borderRadius: '20px' }}
                >
                  🗺️ Standard Map
                </button>
                <button
                  onClick={() => setMapType('k')}
                  className={`abtn ${mapType === 'k' ? 'abtn-p' : 'abtn-o'}`}
                  style={{ fontSize: '0.55rem', padding: '0.4rem 0.8rem', borderRadius: '20px' }}
                >
                  🛰️ Satellite / Terrain
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.8rem', borderTop: '1px solid rgba(201,150,58,0.1)' }}>
              {CATEGORIES.map(c => {
                const active = filter === c;
                return (
                  <button
                    key={c}
                    onClick={() => setFilter(c)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      fontFamily: "'Cinzel', serif",
                      fontSize: '0.55rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      transition: 'all 0.2s ease',
                      background: active ? 'var(--gold)' : 'rgba(201,150,58,0.06)',
                      color: active ? 'var(--darker)' : 'rgba(245,237,216,0.7)',
                      border: active ? 'none' : '1px solid rgba(201,150,58,0.2)',
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Grid: Google Maps Embed + Places Sidebar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '2rem', alignItems: 'start' }}>
            
            {/* Left Column: Embedded Google Map */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                className="glass"
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '2px solid var(--gold)',
                  boxShadow: '0 15px 50px rgba(0,0,0,0.8)',
                }}
              >
                {/* Map Sub-Header Bar */}
                <div
                  style={{
                    padding: '0.8rem 1.2rem',
                    background: 'rgba(201,150,58,0.12)',
                    borderBottom: '1px solid rgba(201,150,58,0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{selectedPlace ? selectedPlace.icon : '📍'}</span>
                    <span className="cinzel" style={{ fontSize: '0.7rem', color: 'var(--cream)', fontWeight: 'bold' }}>
                      {selectedPlace ? selectedPlace.name : 'Ogere Remo Overview'}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.55rem',
                      background: 'rgba(22,163,74,0.25)',
                      color: '#86efac',
                      border: '1px solid #22c55e',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontFamily: "'Cinzel', serif",
                    }}
                  >
                    ● Google Maps Live
                  </span>
                </div>

                {/* Google Map Iframe */}
                <div style={{ width: '100%', height: '440px', background: '#1c1008', position: 'relative' }}>
                  <iframe
                    title="Ogere Remo Google Map"
                    src={getGoogleMapsUrl()}
                    style={{ width: '100%', height: '100%', border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                {/* Map Bottom Controls */}
                <div
                  style={{
                    padding: '0.8rem 1.2rem',
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.8rem',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'rgba(245,237,216,0.6)' }}>
                    📍 Coordinates: <strong>{selectedPlace ? `${selectedPlace.lat}° N, ${selectedPlace.lng}° E` : '6.9371° N, 3.6335° E'}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {selectedPlace && (
                      <a
                        href={getDirectDirectionsUrl(selectedPlace)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-p"
                        style={{ fontSize: '0.62rem', padding: '0.4rem 0.9rem', textDecoration: 'none' }}
                      >
                        🚗 Get Directions →
                      </a>
                    )}
                    <a
                      href="https://maps.google.com/?q=Ogere+Remo,+Ogun+State,+Nigeria"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-o"
                      style={{ fontSize: '0.62rem', padding: '0.4rem 0.9rem', textDecoration: 'none' }}
                    >
                      Open in App ↗
                    </a>
                  </div>
                </div>
              </div>

              {/* Selected Place Highlight Card */}
              {selectedPlace && (
                <div
                  className="glass card"
                  style={{
                    padding: '1.5rem',
                    borderRadius: '14px',
                    borderLeft: `4px solid ${selectedPlace.color}`,
                    animation: 'fadeUp 0.3s ease both',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <span
                      style={{
                        fontSize: '0.52rem',
                        background: selectedPlace.color + '25',
                        color: selectedPlace.color,
                        border: `1px solid ${selectedPlace.color}60`,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontFamily: "'Cinzel', serif",
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                      }}
                    >
                      {selectedPlace.cat} · {selectedPlace.highlight}
                    </span>
                    {selectedPlace.rating && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>{selectedPlace.rating}</span>
                    )}
                  </div>

                  <h3 className="playfair" style={{ fontSize: '1.3rem', color: 'var(--cream)', marginBottom: '0.4rem' }}>
                    {selectedPlace.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(245,237,216,0.55)', marginBottom: '0.8rem' }}>
                    📍 {selectedPlace.address}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.8)', lineHeight: 1.7, marginBottom: '1rem' }}>
                    {selectedPlace.note}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem', borderTop: '1px solid rgba(201,150,58,0.15)', paddingTop: '0.8rem', fontSize: '0.75rem' }}>
                    {selectedPlace.hours && (
                      <div style={{ color: 'rgba(245,237,216,0.65)' }}>🕐 {selectedPlace.hours}</div>
                    )}
                    {selectedPlace.phone && (
                      <div style={{ color: 'var(--gold)' }}>
                        <a href={`tel:${selectedPlace.phone.split('/')[0].trim()}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          📞 {selectedPlace.phone}
                        </a>
                      </div>
                    )}
                    {selectedPlace.website && (
                      <div>
                        <a href={selectedPlace.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-light)' }}>
                          🌐 Official Website ↗
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Key Places List Navigator */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="cinzel" style={{ fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  ⭐ Featured Key Places ({filteredPlaces.length})
                </h3>
                <span style={{ fontSize: '0.68rem', color: 'rgba(245,237,216,0.45)' }}>Click to view on map</span>
              </div>

              <div style={{ display: 'grid', gap: '0.8rem', maxHeight: '720px', overflowY: 'auto', paddingRight: '4px' }}>
                {filteredPlaces.map(place => {
                  const isSelected = selectedPlace?.id === place.id;
                  return (
                    <div
                      key={place.id}
                      onClick={() => setSelectedPlace(place)}
                      className="glass card"
                      style={{
                        padding: '1rem 1.2rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: isSelected ? `2px solid var(--gold)` : '1px solid rgba(201,150,58,0.15)',
                        borderLeft: `4px solid ${place.color}`,
                        background: isSelected ? 'rgba(201,150,58,0.12)' : 'rgba(201,150,58,0.03)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{place.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                            <h4 className="playfair" style={{ fontSize: '1rem', color: isSelected ? 'var(--gold)' : 'var(--cream)', margin: 0 }}>
                              {place.name}
                            </h4>
                            {isSelected && <span style={{ fontSize: '0.65rem', color: 'var(--gold)' }}>📍 Active</span>}
                          </div>
                          <div className="cinzel" style={{ fontSize: '0.52rem', color: place.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                            {place.cat} · {place.highlight}
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'rgba(245,237,216,0.6)', lineHeight: 1.5, margin: 0 }}>
                            {place.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </Section>
      <AdireDivider />
    </div>
  );
}
