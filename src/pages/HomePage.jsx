import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';
import { sendAnthropicMessage } from '../services/api';
import DailyPhrase from '../components/DailyPhrase';
import SuggestionBox from '../components/SuggestionBox';
import { photos } from '../data/gallery';

const CARDS = [
  { id: 'monarchy', ic: '👑', t: 'The Monarchy & Palace', d: 'HRH Oba James Obafemi Saliu, ruling houses & royal court.' },
  { id: 'royal-audience', ic: '📜', t: 'Book Royal Audience', d: 'Schedule an official appointment with the Ologere of Ogere.' },
  { id: 'id-card', ic: '🪪', t: 'Digital Community ID', d: 'Apply for official verifiable Ogere citizen & resident identity.' },
  { id: 'verify-id', ic: '🔍', t: 'Verify Digital ID', d: 'Public registry to verify authentic Ogere ID cards online.' },
  { id: 'marketplace', ic: '🛒', t: 'Town Marketplace', d: 'Buy and sell farm produce, Adire textiles, and local crafts.' },
  { id: 'map', ic: '🗺️', t: 'Google Maps & Places', d: 'Explore palaces, resorts, markets & emergency services on Google Maps.' },
  { id: 'land-registry', ic: '📋', t: 'Land Registry & Plots', d: 'Verify surveys, check family boundaries & resolve disputes.' },
  { id: 'scholarships', ic: '🎓', t: 'Scholarships & Grants', d: 'Educational bursaries, STEM awards & youth tech funding.' },
  { id: 'health', ic: '🏥', t: 'Health & Blood Bank', d: 'Primary health centres and emergency donor registry.' },
  { id: 'live', ic: '🎥', t: 'Palace Live TV', d: 'Live broadcasts of royal coronations, festivals & town meetings.' },
  { id: 'quiz', ic: '🧠', t: 'Heritage Scholar Quiz', d: 'Test your 600-year history knowledge and earn royal certificate.' },
  { id: 'oriki', ic: '📿', t: 'Royal Oriki Chants', d: 'Ancient praise poetry of Ologere kings and compounds.' },
  { id: 'diaspora', ic: '🌍', t: 'Diaspora & Giving', d: 'Global network directory and community project endowment.' },
  { id: 'business', ic: '💼', t: 'Business Directory', d: 'Find verified enterprises, contractors, and artisans.' },
  { id: 'associations', ic: '🤝', t: 'Societies & Groups', d: 'OCDA, OYDA, Lagos Forum, OMCOOSA Alumni.' },
  { id: 'education', ic: '🏫', t: 'Schools & Education', d: 'Primary, secondary, and vocational learning centres.' },
  { id: 'faith', ic: '⛪', t: 'Faith & Spiritual Roots', d: 'Aladura birthplace, mosques, shrines, and festivals.' },
  { id: 'history', ic: '📖', t: 'Founding History', d: '600-year chronicles from Prince Olipakala to modern era.' },
  { id: 'timeline', ic: '⏳', t: 'Dynastic Timeline', d: 'Chronological reigns of all Ologere of Ogere Remo.' },
  { id: 'forum', ic: '💬', t: 'Community Forum', d: 'Public deliberations, community notices & discussions.' },
  { id: 'alerts', ic: '🚨', t: 'Security Command', d: 'Incident reporting and 24/7 emergency dispatch numbers.' },
  { id: 'gallery', ic: '📸', t: 'Media Archives', d: 'Historic photo collections, pageants, and civic ceremonies.' },
  { id: 'miss-olipakala', ic: '👸', t: 'Miss Olipakala Pageant', d: 'Annual cultural beauty pageant celebrating our daughters.' },
  { id: 'contact', ic: '📬', t: 'Contact OCDA', d: 'Reach the central secretariat and community liaison desk.' },
];

const QUICK_ACTIONS = [
  { ti: '🪪 Digital ID Card', path: '/id-card', sub: 'Apply Online' },
  { ti: '👑 Royal Audience', path: '/royal-audience', sub: 'Book Appointment' },
  { ti: '🛒 Marketplace', path: '/marketplace', sub: 'Buy & Sell Local' },
  { ti: '🗺️ Google Maps', path: '/map', sub: 'Explore Landmarks' },
  { ti: '🎁 Diaspora Giving', path: '/diaspora', sub: 'Fund Projects' },
  { ti: '🧠 Heritage Quiz', path: '/quiz', sub: 'Earn Certificate' },
];

const WMO_CODES = {
  0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
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
      <SEO
        title="Home — Kingdom of Ogere Remo Official Portal"
        description="Official community portal of Ogere Remo, Ogun State, Nigeria. Heritage, Monarchy, Digital ID, Marketplace, Land Registry, and Google Maps."
      />
      
      {/* Hero Section */}
      <div
        style={{
          minHeight: '92vh',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          overflow: 'hidden',
          padding: 'clamp(5rem, 12vh, 8rem) 1.5rem 4rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(rgba(13, 7, 4, 0.82), rgba(13, 7, 4, 0.5)), url(/images/Ogere%20Town.jpg) center/cover no-repeat',
            transform: 'scale(1.05)',
            filter: 'grayscale(20%) brightness(0.8)',
          }}
        />
        
        {/* Ambient Glows */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '30vw', height: '30vw', background: 'var(--gold)', opacity: 0.12, filter: 'blur(100px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '20vw', height: '20vw', background: 'var(--red)', opacity: 0.1, filter: 'blur(80px)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1000, animation: 'fadeUp 0.8s ease both' }}>
          {!aiBusy && aiMsg && (
            <p className="playfair" style={{ fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--gold-light)', marginBottom: '1.8rem', opacity: 0.9 }}>
              &ldquo;{aiMsg}&rdquo;
            </p>
          )}
          
          <p className="cinzel" style={{ fontSize: '0.82rem', letterSpacing: '0.45em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem', fontWeight: 700 }}>
            The Ancient Kingdom of
          </p>
          
          <h1 className="cinzel" style={{ fontSize: 'clamp(3.5rem, 12vw, 8.5rem)', fontWeight: 900, lineHeight: 0.9, color: 'var(--cream)', marginBottom: '1.8rem' }}>
            Ogere<span style={{ color: 'var(--gold)', display: 'block', fontSize: '0.78em' }}>Remo</span>
          </h1>
          
          <div style={{ height: '3px', width: '90px', background: 'var(--gold)', margin: '0 auto 2rem', boxShadow: '0 0 20px var(--gold)' }} />
          
          <p className="baskerville" style={{ fontSize: 'clamp(1rem, 2.2vw, 1.35rem)', color: 'rgba(245, 237, 216, 0.85)', maxWidth: 740, margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
            Established upon the eternal hills in 1401 A.D. by Prince Olipakala. A sovereign sanctuary of Yoruba heritage, royal monarchies, and thriving community innovation.
          </p>

          {/* Quick Action Navigation Buttons */}
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            {QUICK_ACTIONS.map(qa => (
              <button
                key={qa.path}
                onClick={() => navigate(qa.path)}
                className="glass"
                style={{
                  padding: '0.65rem 1.1rem',
                  borderRadius: '30px',
                  border: '1px solid rgba(201,150,58,0.3)',
                  cursor: 'pointer',
                  color: 'var(--cream)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease',
                  background: 'rgba(201,150,58,0.08)',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{qa.ti}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(2rem, 5vw, 4rem)', flexWrap: 'wrap' }}>
            {[['1401 A.D.', 'Ancient Founding'], ['33', 'Remo Towns'], ['600+', 'Years Dynastic Heritage'], ['4 Quarters', 'Agbele, Lisa, Igan, Legunsen']].map(([n, l]) => (
              <div key={l}>
                <div className="cinzel" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '0.2rem' }}>{n}</div>
                <div className="cinzel" style={{ fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(245, 237, 216, 0.5)', textTransform: 'uppercase' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdireDivider />

      {/* Weather Forecast Banner */}
      {weather && (
        <Section py="3.5rem">
          <div className="glass" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderRadius: '14px', textAlign: 'center', borderTop: '3px solid var(--gold)' }}>
            <p className="cinzel" style={{ fontSize: '0.68rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              CURRENT ATMOSPHERE & WEATHER IN OGERE REMO
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 3vw, 4rem)', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>{getWeatherEmoji(weather.current.weather_code)}</div>
                <div className="cinzel" style={{ fontSize: '2.8rem', color: 'var(--cream)', lineHeight: 1, fontWeight: 700 }}>
                  {Math.round(weather.current.temperature_2m)}°C
                </div>
                <div className="baskerville" style={{ fontSize: '0.95rem', color: 'rgba(245, 237, 216, 0.6)', marginTop: '0.4rem' }}>
                  {WMO_CODES[weather.current.weather_code]} · Humidity {weather.current.relative_humidity_2m}%
                </div>
              </div>
              
              <div style={{ height: '70px', width: '1px', background: 'rgba(201, 150, 58, 0.2)' }} className="weather-sep" />

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {weather.daily.time.map((date, i) => {
                  const d = new Date(date + 'T12:00:00');
                  const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
                  return (
                    <div key={i} style={{ textAlign: 'center', minWidth: '65px' }}>
                      <div className="cinzel" style={{ fontSize: '0.62rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>{day}</div>
                      <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>{getWeatherEmoji(weather.daily.weather_code[i])}</div>
                      <div style={{ fontSize: '1rem', color: 'var(--cream)', fontWeight: 700 }}>{Math.round(weather.daily.temperature_2m_max[i])}°C</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Daily Yoruba Phrase of the Day */}
      <Section bg="var(--dark)" py="2.5rem">
        <DailyPhrase />
      </Section>

      <AdireDivider />

      {/* Interactive Google Map Section */}
      <Section py="5rem">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.75rem', marginBottom: '0.8rem' }}>
            GEOGRAPHY & PLACES
          </p>
          <h2 className="playfair" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--cream)', fontWeight: 700, marginBottom: '1rem' }}>
            Explore Ogere Remo on Google Maps
          </h2>
          <p className="baskerville" style={{ color: 'rgba(245, 237, 216, 0.7)', maxWidth: '680px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.8 }}>
            Interactive satellite navigation across the palaces, markets, resorts, emergency facilities, and ancient hills of Ogereland.{' '}
            <Link to="/map" style={{ color: 'var(--gold)', borderBottom: '1px solid var(--gold)' }}>
              Open Full Interactive Google Map →
            </Link>
          </p>
        </div>

        <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--gold)', boxShadow: 'var(--shadow-gold)' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(201, 150, 58, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(201, 150, 58, 0.08)', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span className="cinzel" style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 700 }}>
              📍 LIVE GOOGLE MAPS · OGERE REMO (6°47′N, 3°34′E)
            </span>
            <Link to="/map" className="btn-p" style={{ fontSize: '0.62rem', padding: '0.35rem 0.9rem', textDecoration: 'none' }}>
              Launch Full Map & Navigator →
            </Link>
          </div>

          <div style={{ width: '100%', height: '400px', background: '#1c1008' }}>
            <iframe
              title="Ogere Remo Google Map Live Preview"
              src="https://maps.google.com/maps?q=Ogere+Remo,+Ogun+State,+Nigeria&t=m&z=14&ie=UTF8&iwloc=&output=embed"
              style={{ width: '100%', height: '100%', border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Quick Landmark Jump Pills */}
          <div style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.5)', display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>KEY PLACES:</span>
            {[
              ['👑 Aafin Ologere Palace', '/map'],
              ['🏨 Ogere Resort & Convention Centre', '/map'],
              ['🛖 Ogere Central Market', '/map'],
              ['🏫 Ositelu Memorial College', '/map'],
              ['⛪ Church of the Lord (Aladura) HQ', '/map'],
              ['🏥 Primary Health Centre', '/map'],
              ['🌿 Agbele Heights', '/map'],
            ].map(([ti, href]) => (
              <Link
                key={ti}
                to={href}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '16px',
                  background: 'rgba(201,150,58,0.1)',
                  border: '1px solid rgba(201,150,58,0.25)',
                  color: 'var(--cream)',
                  textDecoration: 'none',
                }}
              >
                {ti}
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* Community Portals & Services Directory */}
      <Section bg="var(--dark)" py="5rem">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.75rem', marginBottom: '0.8rem' }}>
            SERVICES & OPERATIONS
          </p>
          <h2 className="playfair" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', color: 'var(--cream)' }}>
            Ogere Remo Digital Portals
          </h2>
          <p style={{ color: 'rgba(245,237,216,0.6)', maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '0.95rem' }}>
            Explore verified civic tools, commercial marketplaces, cultural archives, and official palace registries.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(270px, 100%), 1fr))', gap: '1.5rem' }}>
          {CARDS.map((t) => (
            <button
              key={t.id}
              onClick={() => navigate(`/${t.id}`)}
              className="glass card"
              style={{
                padding: 'clamp(1.2rem, 3vw, 1.8rem)',
                textAlign: 'left',
                borderRadius: '14px',
                borderTop: '3px solid var(--gold)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '2.4rem', marginBottom: '1rem' }}>{t.ic}</div>
              <h3 className="cinzel" style={{ fontSize: '0.95rem', color: 'var(--cream)', marginBottom: '0.4rem', fontWeight: 700 }}>
                {t.t}
              </h3>
              <p className="baskerville" style={{ fontSize: '0.85rem', color: 'rgba(245, 237, 216, 0.65)', lineHeight: 1.6 }}>
                {t.d}
              </p>
            </button>
          ))}
        </div>
      </Section>

      <AdireDivider />

      {/* Heritage Photo Highlights */}
      <Section py="5rem">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: 'min(280px, 100%)' }}>
            <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.75rem', marginBottom: '0.8rem' }}>
              HERITAGE HIGHLIGHTS
            </p>
            <h2 className="playfair" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--cream)', fontWeight: 700 }}>
              Snapshots of Ogereland
            </h2>
          </div>
          <Link to="/gallery" className="btn-o">
            View Media Archives (100+ Photos) →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '2rem' }}>
          {photos.slice(0, 3).map((p, i) => (
            <div key={i} className="glass card" style={{ borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ height: '230px', background: `url(${p.src}) center/cover`, borderBottom: '1px solid rgba(201, 150, 58, 0.15)' }} />
              <div style={{ padding: '1.4rem' }}>
                <div className="cinzel" style={{ fontSize: '0.58rem', color: 'var(--gold)', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  {p.cat}
                </div>
                <h4 className="playfair" style={{ fontSize: '1.25rem', color: 'var(--cream)', marginBottom: '0.6rem' }}>
                  {p.title}
                </h4>
                <p className="baskerville" style={{ fontSize: '0.85rem', color: 'rgba(245, 237, 216, 0.65)', lineHeight: 1.6 }}>
                  {p.desc.length > 110 ? p.desc.substring(0, 110) + '…' : p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <AdireDivider />

      {/* Suggestion Box Section */}
      <Section py="5rem" bg="var(--dark)">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <SuggestionBox />
        </div>
      </Section>

      <AdireDivider />
    </div>
  );
}
