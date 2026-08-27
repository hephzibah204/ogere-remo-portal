import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';
import { sendAnthropicMessage } from '../services/api';
import DailyPhrase from '../components/DailyPhrase';
import SuggestionBox from '../components/SuggestionBox';
import { MAP_LOCATIONS, CAT_COLORS } from '../data/mapLocations';
import { photos } from '../data/gallery';

const cards = [
  { id: 'history', ic: '📜', t: 'History', d: '600 years of Yoruba tradition.' },
  { id: 'monarchy', ic: '👑', t: 'Monarchy', d: 'Kings, ruling houses & royal governance.' },
  { id: 'associations', ic: '🤝', t: 'Associations', d: 'OCDA, OYDA, Lagos Forum, OMCOOSA.' },
  { id: 'education', ic: '🏫', t: 'Education', d: 'Schools and notable alumni.' },
  { id: 'faith', ic: '⛪', t: 'Faith & Culture', d: 'Aladura, Lipakala Day, festivals.' },
  { id: 'gallery', ic: '📸', t: 'Photo Gallery', d: 'Coronations, festivals, development.' },
  { id: 'news', ic: '📰', t: 'News & Events', d: 'Community updates and news.' },
  { id: 'marketplace', ic: '🛒', t: 'Marketplace', d: 'Buy and sell local goods.' },
  { id: 'health', ic: '🏥', t: 'Health & Blood Bank', d: 'Medical directory & donor registry.' },
  { id: 'scholarships', ic: '🎓', t: 'Scholarships', d: 'Educational grants & bursaries.' },
  { id: 'land-registry', ic: '📋', t: 'Land Registry', d: 'Secure your family land.' },
  { id: 'governance', ic: '📊', t: 'Governance', d: 'Track community projects.' },
  { id: 'tourism', ic: '🏔️', t: 'Tourism', d: 'Hills, Resort, Cultural Centre.' },
  { id: 'business', ic: '💼', t: 'Directory', d: 'Find local businesses & artisans.' },
  { id: 'diaspora', ic: '🌍', t: 'Diaspora Network', d: 'Join the global Ogere family.' },
  { id: 'events', ic: '📅', t: 'Events Calendar', d: 'Festivals, ceremonies & more.' },
  { id: 'forum', ic: '💬', t: 'Community Forum', d: 'Discuss, share, and connect.' },
  { id: 'miss-olipakala', ic: '👑', t: 'Miss Olipakala', d: 'Beauty pageant honouring our heritage.' },
  { id: 'map', ic: '🗺️', t: 'Map', d: 'Find landmarks, emergency services & directions.' },
  { id: 'alerts', ic: '⚠️', t: 'Security Alerts', d: 'Real emergency numbers & bulletins.' },
  { id: 'contact', ic: '📬', t: 'Contact', d: 'Reach the OCDA team.' },
  { id: 'id-card', ic: '🪪', t: 'Digital ID Card', d: 'Apply for your official Ogere community identity card.' },
  { id: 'royal-audience', ic: '👑', t: 'Royal Audience', d: 'Book a formal appointment with the Ologere online.' },
  { id: 'admin', ic: '⚙️', t: 'Admin', d: 'OCDA admin panel.' },
];

const toX = (lng) => Math.round(((lng - 3.580) / (3.646 - 3.580)) * 740 + 30);
const toY = (lat) => Math.round(((6.942 - lat) / (6.942 - 6.883)) * 360 + 30);

const WMO_CODES = {
  0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Depositing Rime Fog', 51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
  61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain', 66: 'Light Freezing Rain', 67: 'Heavy Freezing Rain',
  71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
  80: 'Slight Rain Showers', 81: 'Moderate Rain Showers', 82: 'Violent Rain Showers',
  85: 'Slight Snow Showers', 86: 'Heavy Snow Showers', 95: 'Thunderstorm', 96: 'Thunderstorm with Slight Hail', 99: 'Thunderstorm with Heavy Hail',
};

function getWeatherEmoji(code) {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code >= 45 && code <= 48) return '🌫️';
  if ((code >= 51 && code <= 55) || (code >= 80 && code <= 82)) return '🌦️';
  if ((code >= 61 && code <= 67) || (code >= 85 && code <= 86)) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 95) return '⛈️';
  return '🌡️';
}

export default function HomePage() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [aiMsg, setAiMsg] = useState('');
  const [aiBusy, setAiBusy] = useState(true);
  const [mapPin, setMapPin] = useState(null);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=6.9371&longitude=3.6335&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Africa/Lagos&forecast_days=3')
      .then(r => r.json())
      .then(d => setWeather(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      const msg = await sendAnthropicMessage(
        'You are the official AI greeter for the Ogere Remo Community Portal website. Ogere Remo is an ancient Yoruba town in Ogun State, Nigeria, founded circa 1401 A.D. Respond with a warm, poetic 1-2 sentence welcome that reflects the town\'s heritage, pride, and Yoruba spirit. Use at most 25 words.',
        'A visitor has arrived at the Ogere Remo Community Portal. Welcome them.'
      );
      if (msg) setAiMsg(msg);
      setAiBusy(false);
    })();
  }, []);

  return (
    <div style={{ background: 'var(--darker)' }}>
      <SEO title="Home" description="Official community portal of Ogere Remo — Ancient town in Ogun State, Nigeria, founded circa 1401 A.D." />
      
      {/* Hero Section */}
      <div
        style={{
          minHeight: '100vh',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          overflow: 'hidden',
          padding: 'var(--nav-height) 1.5rem 4rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(rgba(13, 7, 4, 0.8), rgba(13, 7, 4, 0.4)), url(/images/Ogere%20Town.jpg) center/cover no-repeat',
            transform: 'scale(1.05)',
            filter: 'grayscale(20%) brightness(0.8)',
          }}
        />
        
        {/* Ambient Glows */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '30vw', height: '30vw', background: 'var(--gold)', opacity: 0.1, filter: 'blur(100px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '20vw', height: '20vw', background: 'var(--red)', opacity: 0.1, filter: 'blur(80px)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1000, animation: 'fadeUp 1s ease both' }}>
          {!aiBusy && aiMsg && (
            <p className="playfair" style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--gold-light)', marginBottom: '2rem', opacity: 0.8 }}>
              &ldquo;{aiMsg}&rdquo;
            </p>
          )}
          
          <p className="cinzel" style={{ fontSize: '0.8rem', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.5rem', fontWeight: 700 }}>
            The Ancient Realm of
          </p>
          
          <h1 className="cinzel" style={{ fontSize: 'clamp(4rem, 15vw, 10rem)', fontWeight: 900, lineHeight: 0.85, color: 'var(--cream)', marginBottom: '2rem' }}>
            Ogere<span style={{ color: 'var(--gold)', display: 'block', fontSize: '0.8em' }}>Remo</span>
          </h1>
          
          <div style={{ height: '3px', width: '80px', background: 'var(--gold)', margin: '0 auto 2.5rem', boxShadow: '0 0 20px var(--gold)' }} />
          
          <p className="baskerville" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', color: 'rgba(245, 237, 216, 0.8)', maxWidth: 700, margin: '0 auto 3rem', lineHeight: 1.8 }}>
            Nestled upon the eternal hills since 1401 A.D. A sanctuary of Yoruba heritage, royal lineage, and enduring community spirit.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            {[['1401', 'Established'], ['33', 'Remo Towns'], ['600+', 'Years Heritage']].map(([n, l]) => (
              <div key={l}>
                <div className="cinzel" style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '0.2rem' }}>{n}</div>
                <div className="cinzel" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(245, 237, 216, 0.4)', textTransform: 'uppercase' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdireDivider />

      {weather && (
        <Section py="4rem">
          <div className="glass" style={{ padding: 'clamp(1.5rem, 4vw, 3rem)', borderRadius: '12px', textAlign: 'center' }}>
            <p className="cinzel" style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '2rem' }}>Current Atmosphere</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 3vw, 4rem)', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{getWeatherEmoji(weather.current.weather_code)}</div>
                <div className="cinzel" style={{ fontSize: '3rem', color: 'var(--cream)', lineHeight: 1, fontWeight: 700 }}>{Math.round(weather.current.temperature_2m)}°C</div>
                <div className="baskerville" style={{ fontSize: '1rem', color: 'rgba(245, 237, 216, 0.5)', marginTop: '0.5rem' }}>{WMO_CODES[weather.current.weather_code]}</div>
              </div>
              
              <div style={{ height: '80px', width: '1px', background: 'rgba(201, 150, 58, 0.2)' }} className="weather-sep" />

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {weather.daily.time.map((date, i) => {
                  const d = new Date(date + 'T12:00:00');
                  const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
                  return (
                    <div key={i} style={{ textAlign: 'center', minWidth: '60px' }}>
                      <div className="cinzel" style={{ fontSize: '0.65rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem' }}>{day}</div>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{getWeatherEmoji(weather.daily.weather_code[i])}</div>
                      <div style={{ fontSize: '1.1rem', color: 'var(--cream)', fontWeight: 700 }}>{Math.round(weather.daily.temperature_2m_max[i])}°</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>
      )}

      <Section bg="var(--dark)" py="2rem">
        <DailyPhrase />
      </Section>

      <AdireDivider />

      <Section py="5rem">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.75rem', marginBottom: '1rem' }}>EXPLORATION</p>
          <h2 className="playfair" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--cream)', fontWeight: 700 }}>The Heritage Map</h2>
          <p className="baskerville" style={{ color: 'rgba(245, 237, 216, 0.6)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
            Navigate through the landmarks and sacred spaces of Ogere. <Link to="/map" style={{ color: 'var(--gold)', borderBottom: '1px solid var(--gold)' }}>View full interactive experience →</Link>
          </p>
        </div>

        <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-gold)' }}>
          <div style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(201, 150, 58, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(201, 150, 58, 0.05)' }}>
            <span className="cinzel" style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700 }}>OGERE REMO LANDMARKS</span>
            <span className="cinzel" style={{ fontSize: '0.6rem', color: 'rgba(245, 237, 216, 0.4)' }}>INTERACTIVE PREVIEW</span>
          </div>
          <svg viewBox="0 0 800 420" style={{ width: '100%', display: 'block', background: 'var(--darker)' }}>
            <defs>
              <radialGradient id="homeTerrain" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#1e2e15" stopOpacity=".9" />
                <stop offset="100%" stopColor="#0D0704" stopOpacity=".95" />
              </radialGradient>
            </defs>
            <rect width="800" height="420" fill="url(#homeTerrain)" />
            <path d="M 0,200 Q 200,195 400,200 Q 600,205 800,200" fill="none" stroke="rgba(255,200,80,.15)" strokeWidth="6" />
            <text x="60" y="192" fill="rgba(255,200,80,.3)" fontSize="9" fontFamily="'Cinzel',serif">LAGOS–IBADAN EXPRESSWAY</text>
            <path d="M 120,0 Q 125,200 120,420" fill="none" stroke="rgba(200,160,80,.12)" strokeWidth="4" strokeDasharray="8,4" />
            <ellipse cx="650" cy="120" rx="60" ry="35" fill="rgba(45,74,34,.15)" stroke="rgba(45,74,34,.3)" strokeWidth="1" />
            <text x="665" y="124" fill="rgba(168,216,142,.3)" fontSize="9" fontFamily="'Cinzel',serif" textAnchor="middle">THE HILLS</text>
            {MAP_LOCATIONS.map(loc => {
              const x = toX(loc.lng);
              const y = toY(loc.lat);
              const isSel = mapPin && mapPin.id === loc.id;
              return (
                <g key={loc.id} onClick={() => setMapPin(mapPin?.id === loc.id ? null : loc)} style={{ cursor: 'pointer' }}>
                  {isSel && <circle cx={x} cy={y} r="22" fill="none" stroke={loc.color} strokeWidth="1.5" opacity=".5"><animate attributeName="r" values="18;28;18" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values=".6;0;.6" dur="2s" repeatCount="indefinite" /></circle>}
                  <ellipse cx={x + 2} cy={y + 18} rx="8" ry="3" fill="rgba(0,0,0,.4)" />
                  <path d={`M${x},${y - 2} C${x - 12},${y - 14} ${x - 12},${y - 26} ${x},${y - 28} C${x + 12},${y - 26} ${x + 12},${y - 14} ${x},${y - 2} Z`} fill={isSel ? loc.color : 'rgba(26,13,6,.9)'} stroke={loc.color} strokeWidth={isSel ? '2' : '1.5'} />
                  <text x={x} y={y - 12} textAnchor="middle" fontSize="11" style={{ pointerEvents: 'none' }}>{loc.icon}</text>
                  <text x={x} y={y + 14} textAnchor="middle" fill={isSel ? loc.color : 'rgba(245,237,216,.4)'} fontSize="8" fontFamily="'Cinzel',serif" style={{ pointerEvents: 'none' }}>{loc.name.length > 16 ? loc.name.slice(0, 15) + '…' : loc.name}</text>
                </g>
              );
            })}
          </svg>
        </div>
        
        {mapPin && (
          <div className="glass reveal active" style={{ marginTop: '2rem', padding: 'clamp(1.2rem, 3vw, 2rem)', borderRadius: '8px', borderLeft: `4px solid ${mapPin.color}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2rem' }}>{mapPin.icon}</span>
                <span className="playfair" style={{ fontSize: '1.5rem', color: 'var(--cream)', fontWeight: 700 }}>{mapPin.name}</span>
                <span style={{ background: mapPin.color, color: '#fff', fontSize: '0.6rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontFamily: 'var(--font-display)' }}>{mapPin.cat}</span>
              </div>
              <p className="baskerville" style={{ color: 'rgba(245, 237, 216, 0.6)', marginBottom: '0.5rem' }}>📍 {mapPin.address}</p>
              <p className="baskerville" style={{ color: 'rgba(245, 237, 216, 0.8)' }}>{mapPin.note}</p>
            </div>
            <a href={mapPin.mapUrl} target="_blank" rel="noopener noreferrer" className="cinzel" style={{ color: 'var(--gold)', border: '1px solid var(--gold)', padding: '0.8rem 1.5rem', borderRadius: '4px', fontSize: '0.7rem', textAlign: 'center', justifySelf: 'start' }}>Google Maps →</a>
          </div>
        )}
      </Section>

      <Section bg="var(--dark)">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.75rem', marginBottom: '1rem' }}>RESOURCES</p>
          <h2 className="playfair" style={{ fontSize: '3rem', color: 'var(--cream)' }}>Discover More</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '1.5rem' }}>
          {cards.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(`/${t.id}`)}
              className="glass card"
              style={{ padding: 'clamp(1.2rem, 3vw, 2rem)', textAlign: 'left', borderRadius: '12px' }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>{t.ic}</div>
              <h3 className="cinzel" style={{ fontSize: '1rem', color: 'var(--gold)', marginBottom: '0.5rem', fontWeight: 700 }}>{t.t}</h3>
              <p className="baskerville" style={{ fontSize: '0.9rem', color: 'rgba(245, 237, 216, 0.6)', lineHeight: 1.6 }}>{t.d}</p>
            </button>
          ))}
        </div>
      </Section>

      <AdireDivider />

      {/* Heritage Highlights */}
      <Section py="5rem">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: 'min(280px, 100%)' }}>
            <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.75rem', marginBottom: '1rem' }}>HERITAGE HIGHLIGHTS</p>
            <h2 className="playfair" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--cream)', fontWeight: 700 }}>Snapshots of Ogere</h2>
          </div>
          <Link to="/gallery" className="btn-o">View Full Gallery →</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '2rem' }}>
          {photos.slice(0, 3).map((p, i) => (
            <div key={i} className="glass card reveal active" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ height: '240px', background: `url(${p.src}) center/cover`, borderBottom: '1px solid rgba(201, 150, 58, 0.1)' }} />
              <div style={{ padding: '1.5rem' }}>
                <div className="cinzel" style={{ fontSize: '0.6rem', color: 'var(--gold)', marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>{p.cat}</div>
                <h4 className="playfair" style={{ fontSize: '1.3rem', color: 'var(--cream)', marginBottom: '0.8rem' }}>{p.title}</h4>
                <p className="baskerville" style={{ fontSize: '0.9rem', color: 'rgba(245, 237, 216, 0.6)', lineHeight: 1.6 }}>{p.desc.substring(0, 100)}...</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <AdireDivider />

      {/* Suggestion Box Section */}
      <Section py="6rem" bg="var(--dark)">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <SuggestionBox />
        </div>
      </Section>

      <AdireDivider />
    </div>
  );
}
