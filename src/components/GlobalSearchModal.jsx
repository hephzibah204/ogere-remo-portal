import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbGetAll } from '../services/db';
import { kings } from '../data/kings';

const STATIC_ROUTES = [
  { ti: 'Home / Town Square', path: '/', cat: 'Pages', ic: '🏛️', sub: 'Welcome to the official Kingdom of Ogere Remo Portal' },
  { ti: 'History of Ogere', path: '/history', cat: 'Pages', ic: '📜', sub: 'Origins of Ogere Remo, Olipakala, and founding ancestors' },
  { ti: 'The Monarchy & Ologere Palace', path: '/monarchy', cat: 'Monarchy', ic: '👑', sub: 'HRH Oba James Obafemi Saliu, ruling houses and kingmakers' },
  { ti: 'Royal Audience Appointment', path: '/royal-audience', cat: 'Palace', ic: '👑', sub: 'Book formal appointment with HRH The Ologere of Ogere' },
  { ti: 'Digital Community ID Card', path: '/id-card', cat: 'Services', ic: '🪪', sub: 'Apply for official digital identity card' },
  { ti: 'Verify Digital ID', path: '/verify-id', cat: 'Services', ic: '🔍', sub: 'Verify authenticity of an Ogere Community ID' },
  { ti: 'Community Marketplace', path: '/marketplace', cat: 'Commerce', ic: '🛒', sub: 'Produce, crafts, Adire textiles, and local services' },
  { ti: 'Digital Land Registry', path: '/land-registry', cat: 'Land', ic: '📋', sub: 'Verify plots, check surveys and boundary disputes' },
  { ti: 'Business Directory', path: '/business', cat: 'Commerce', ic: '🏪', sub: 'Enterprises and registered commercial ventures' },
  { ti: 'Scholarships & Grants', path: '/scholarships', cat: 'Empowerment', ic: '🎓', sub: 'Education awards, bursaries, and youth tech grants' },
  { ti: 'Health & Blood Bank', path: '/health', cat: 'Health', ic: '🏥', sub: 'Primary healthcare centers and emergency donor registry' },
  { ti: 'Security Command & Alerts', path: '/alerts', cat: 'Safety', ic: '🚨', sub: 'Community security bulletins and incident reports' },
  { ti: 'Palace TV & Live Broadcasts', path: '/live', cat: 'Media', ic: '🎥', sub: 'Watch live festivals, coronations, and video archive' },
  { ti: 'Heritage Quiz Challenge', path: '/quiz', cat: 'Culture', ic: '🧠', sub: 'Test your knowledge of Ogere Remo history' },
  { ti: 'Oriki Yoruba Praise Poetry', path: '/oriki', cat: 'Culture', ic: '📿', sub: 'Ancient royal and compound oriki chants' },
  { ti: 'Town Map & Landmarks', path: '/map', cat: 'Explore', ic: '🗺️', sub: 'Interactive map of Ogere Remo quarters and compounds' },
  { ti: 'Diaspora Network', path: '/diaspora', cat: 'Community', ic: '🌍', sub: 'Connect sons and daughters across the UK, USA, Canada' },
  { ti: 'Community Forum', path: '/forum', cat: 'Community', ic: '💬', sub: 'Discussions, notices, and deliberations' },
  { ti: 'Contact OCDA', path: '/contact', cat: 'Governance', ic: '📬', sub: 'Official secretariat addresses and inquiry channels' },
];

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dynamicItems, setDynamicItems] = useState({ marketplace: [], land: [] });
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    (async () => {
      const [mkt, land] = await Promise.all([
        dbGetAll('marketplace'),
        dbGetAll('land_registry'),
      ]);
      setDynamicItems({ marketplace: mkt || [], land: land || [] });
    })();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return STATIC_ROUTES.slice(0, 7);
    }

    const matchedRoutes = STATIC_ROUTES.filter(
      r => r.ti.toLowerCase().includes(q) || r.sub.toLowerCase().includes(q) || r.cat.toLowerCase().includes(q)
    );

    const matchedKings = kings
      .filter(k => (k.n || '').toLowerCase().includes(q) || (k.h || '').toLowerCase().includes(q))
      .map(k => ({
        ti: `${k.n} (${k.t || 'Ologere'})`,
        path: '/monarchy',
        cat: 'Kings',
        ic: '👑',
        sub: `Era: ${k.e || 'Historic'} · House: ${k.h || 'Royal'}`,
      }));

    const matchedMarket = (dynamicItems.marketplace || [])
      .filter(m => (m.title || '').toLowerCase().includes(q) || (m.desc || '').toLowerCase().includes(q) || (m.seller || '').toLowerCase().includes(q))
      .map(m => ({
        ti: m.title,
        path: '/marketplace',
        cat: 'Marketplace',
        ic: m.icon || '🛍️',
        sub: `${m.price} · Seller: ${m.seller} (${m.quarter})`,
      }));

    const matchedLand = (dynamicItems.land || [])
      .filter(l => (l.area || '').toLowerCase().includes(q) || (l.owner || '').toLowerCase().includes(q) || (l.id || '').toLowerCase().includes(q))
      .map(l => ({
        ti: `Plot ${l.id} — ${l.area}`,
        path: '/land-registry',
        cat: 'Land',
        ic: '📜',
        sub: `${l.owner} · ${l.size} · Status: ${l.status}`,
      }));

    return [...matchedRoutes, ...matchedKings, ...matchedMarket, ...matchedLand].slice(0, 10);
  }, [query, dynamicItems]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(searchResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (item) => {
    navigate(item.path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(8px)',
        zIndex: 150000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'clamp(1rem, 6vh, 4rem) 1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '620px',
          width: '100%',
          background: '#120803',
          border: '2px solid var(--gold)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95)',
          animation: 'fadeUp 0.25s ease both',
        }}
      >
        {/* Search Header Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem 1.2rem',
            borderBottom: '1px solid rgba(201,150,58,0.2)',
            gap: '0.8rem',
            background: 'rgba(201,150,58,0.04)',
          }}
        >
          <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>🔍</span>
          <input
            ref={inputRef}
            className="inp"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '1.05rem',
              color: 'var(--cream)',
              outline: 'none',
              boxShadow: 'none',
              padding: '0.4rem 0',
            }}
            placeholder="Search kings, marketplace, land, news, services... (Esc to close)"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              padding: '2px 8px',
              color: 'rgba(245,237,216,0.6)',
              fontSize: '0.7rem',
              cursor: 'pointer',
            }}
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '0.6rem' }}>
          {searchResults.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'rgba(245,237,216,0.5)' }}>
              No matches found for "{query}"
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.9rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(201,150,58,0.15)' : 'transparent',
                    border: isSelected ? '1px solid var(--gold)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{item.ic}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--cream)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {item.ti}
                      </span>
                      <span
                        style={{
                          fontSize: '0.52rem',
                          background: 'rgba(201,150,58,0.2)',
                          color: 'var(--gold)',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontFamily: "'Cinzel', serif",
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.cat}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(245,237,216,0.55)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {item.sub}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: isSelected ? 'var(--gold)' : 'rgba(245,237,216,0.3)' }}>
                    ↵
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '0.6rem 1.2rem',
            background: 'rgba(0,0,0,0.5)',
            borderTop: '1px solid rgba(201,150,58,0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.65rem',
            color: 'rgba(245,237,216,0.45)',
          }}
        >
          <span>Use <strong>↑</strong> <strong>↓</strong> to navigate · <strong>↵</strong> to select</span>
          <span>👑 Ogere Remo Spotlight</span>
        </div>
      </div>
    </div>
  );
}
