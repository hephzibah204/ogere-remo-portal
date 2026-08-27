import { useState, useEffect, useMemo } from 'react';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';
import { dbGetAll, dbInsert, SEED_DATA } from '../services/db';

const CATEGORIES = [
  { id: 'All', label: 'All Items', icon: '🛍️' },
  { id: 'Farm Produce', label: 'Farm Produce', icon: '🌾' },
  { id: 'Crafts & Adire', label: 'Crafts & Adire', icon: '🪡' },
  { id: 'Food & Catering', label: 'Food & Catering', icon: '🍲' },
  { id: 'Services', label: 'Artisan Services', icon: '⚡' },
  { id: 'Trade & Retail', label: 'Trade & Building', icon: '🏗️' },
  { id: 'Fashion & Beads', label: 'Fashion & Beads', icon: '📿' },
  { id: 'Property', label: 'Land & Property', icon: '🏡' },
];

const QUARTERS = [
  'All Quarters',
  'Oke-Ogere',
  'Isale-Ogere',
  'Ago-Ogere',
  'Idi-Iroko',
  'Ajura Zone',
  'Market Road / Oja Ale',
  'Remo-North Axis',
  'Expressway Bypass',
];

const BADGE_COLORS = {
  organic: '#16a34a',
  handmade: '#9333ea',
  popular: '#dc2626',
  certified: '#2563eb',
  fresh: '#059669',
  bulk: '#d97706',
  pro: '#0891b2',
  registered: '#C9963A',
  featured: '#eab308',
};

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedQuarter, setSelectedQuarter] = useState('All Quarters');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [savedFavorites, setSavedFavorites] = useState(() => {
    try {
      const s = localStorage.getItem('ogere_marketplace_favs');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [showOnlyFavs, setShowOnlyFavs] = useState(false);

  // Modals & UI states
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Order modal states
  const [orderModalItem, setOrderModalItem] = useState(null);
  const [orderForm, setOrderForm] = useState({
    buyerName: '',
    phone: '',
    address: 'Ogere Remo Town',
    quantity: '1',
    note: '',
  });

  // Offer modal state
  const [offerModalItem, setOfferModalItem] = useState(null);
  const [offerAmount, setOfferAmount] = useState('');

  // Listing creation form
  const [newForm, setNewForm] = useState({
    title: '',
    category: 'Farm Produce',
    desc: '',
    priceNumber: '',
    priceUnit: 'per tuber',
    isNegotiable: true,
    condition: 'Fresh Harvest',
    stockStatus: 'In Stock',
    seller: '',
    quarter: 'Oke-Ogere',
    phone: '',
    whatsapp: '',
    email: '',
    imageUrl: '',
    isFeatured: false,
  });

  const loadData = async () => {
    let data = await dbGetAll('marketplace');
    if (!data || data.length < 5) {
      if (SEED_DATA && SEED_DATA.marketplace) {
        data = SEED_DATA.marketplace;
      }
    }
    setListings(data || []);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = (e) => setListings(e.detail || []);
    window.addEventListener('db-marketplace-updated', handleUpdate);
    return () => window.removeEventListener('db-marketplace-updated', handleUpdate);
  }, []);

  const toggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    let updated;
    if (savedFavorites.includes(id)) {
      updated = savedFavorites.filter(favId => favId !== id);
    } else {
      updated = [...savedFavorites, id];
    }
    setSavedFavorites(updated);
    localStorage.setItem('ogere_marketplace_favs', JSON.stringify(updated));
  };

  const handleShare = async (item, e) => {
    if (e) e.stopPropagation();
    const url = window.location.href.split('?')[0] + `?item=${item.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Check out "${item.title}" on the Ogere Remo Marketplace! Price: ${item.price}`,
          url,
        });
        return;
      } catch {
        // Fallback
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewForm(prev => ({ ...prev, imageUrl: ev.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const cleanPhone = (newForm.phone || '').replace(/\D/g, '');
    const cleanWhatsApp = (newForm.whatsapp || newForm.phone || '').replace(/\D/g, '');

    let formattedPrice = newForm.priceNumber;
    if (formattedPrice && !formattedPrice.toLowerCase().includes('quote') && !formattedPrice.includes('₦')) {
      formattedPrice = `₦${Number(formattedPrice.replace(/,/g, '')).toLocaleString()} ${newForm.priceUnit ? `/ ${newForm.priceUnit}` : ''}`;
    }

    const newItem = {
      id: `MKT-${Math.floor(100 + Math.random() * 900)}`,
      cat: newForm.category,
      title: newForm.title,
      desc: newForm.desc,
      price: formattedPrice || 'Quote on request',
      isNegotiable: newForm.isNegotiable,
      condition: newForm.condition,
      stockStatus: newForm.stockStatus,
      seller: newForm.seller,
      quarter: newForm.quarter,
      phone: newForm.phone,
      whatsapp: cleanWhatsApp.startsWith('0') ? '234' + cleanWhatsApp.slice(1) : cleanWhatsApp,
      email: newForm.email,
      imageUrl: newForm.imageUrl,
      icon:
        newForm.category === 'Farm Produce'
          ? '🌾'
          : newForm.category === 'Crafts & Adire'
          ? '🪡'
          : newForm.category === 'Food & Catering'
          ? '🍲'
          : newForm.category === 'Services'
          ? '⚡'
          : newForm.category === 'Fashion & Beads'
          ? '📿'
          : newForm.category === 'Property'
          ? '🏡'
          : '🏪',
      badge: newForm.isFeatured ? 'featured' : newForm.category === 'Farm Produce' ? 'organic' : 'fresh',
      verified: true,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    await dbInsert('marketplace', newItem);
    setFormSubmitted(true);
    setLoading(false);
    setNewForm({
      title: '',
      category: 'Farm Produce',
      desc: '',
      priceNumber: '',
      priceUnit: 'per tuber',
      isNegotiable: true,
      condition: 'Fresh Harvest',
      stockStatus: 'In Stock',
      seller: '',
      quarter: 'Oke-Ogere',
      phone: '',
      whatsapp: '',
      email: '',
      imageUrl: '',
      isFeatured: false,
    });
    setTimeout(() => {
      setShowForm(false);
      setFormSubmitted(false);
    }, 3000);
  };

  // Filter & Search Logic
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // Category filter
      if (activeCategory !== 'All' && item.cat !== activeCategory) return false;

      // Quarter filter
      if (selectedQuarter !== 'All Quarters' && item.quarter !== selectedQuarter) return false;

      // Verified filter
      if (onlyVerified && !item.verified) return false;

      // Saved favorites filter
      if (showOnlyFavs && !savedFavorites.includes(item.id)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchDesc = (item.desc || '').toLowerCase().includes(q);
        const matchSeller = (item.seller || '').toLowerCase().includes(q);
        const matchQuarter = (item.quarter || '').toLowerCase().includes(q);
        const matchCat = (item.cat || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSeller && !matchQuarter && !matchCat) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'verified') {
        return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
      }
      return 0;
    });
  }, [listings, activeCategory, selectedQuarter, onlyVerified, showOnlyFavs, savedFavorites, searchQuery, sortBy]);

  // Construct WhatsApp order link
  const sendWhatsAppOrder = (item, formDetails) => {
    const cleanWhatsApp = (item.whatsapp || item.phone || '').replace(/\D/g, '');
    const phoneTarget = cleanWhatsApp.startsWith('0') ? '234' + cleanWhatsApp.slice(1) : cleanWhatsApp;
    const msg = `👑 *OGERE REMO MARKETPLACE ORDER* 👑\n\n` +
      `Hello *${item.seller}*,\n` +
      `I would like to place an order for your listing on the Ogere Community Portal:\n\n` +
      `📦 *Item:* ${item.title}\n` +
      `💰 *Listed Price:* ${item.price}\n` +
      `🔢 *Quantity / Units:* ${formDetails.quantity}\n` +
      `👤 *Buyer Name:* ${formDetails.buyerName}\n` +
      `📍 *Delivery / Pickup in Ogere:* ${formDetails.address}\n` +
      (formDetails.note ? `📝 *Note:* ${formDetails.note}\n\n` : `\n`) +
      `Please confirm availability and bank details for payment. Ẹ ṣéun!`;

    const url = `https://wa.me/${phoneTarget}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setOrderModalItem(null);
  };

  // Construct WhatsApp price negotiation link
  const sendWhatsAppOffer = (item, amount) => {
    const cleanWhatsApp = (item.whatsapp || item.phone || '').replace(/\D/g, '');
    const phoneTarget = cleanWhatsApp.startsWith('0') ? '234' + cleanWhatsApp.slice(1) : cleanWhatsApp;
    const msg = `👑 *OGERE MARKETPLACE PRICE OFFER* 👑\n\n` +
      `Hello *${item.seller}*,\n` +
      `I saw your listing for *"${item.title}"* (${item.price}) on the Ogere Portal.\n\n` +
      `🤝 *My Proposed Price Offer:* ₦${Number(amount.replace(/,/g, '')).toLocaleString()}\n\n` +
      `Can we agree on this price? I am ready for immediate pickup/order. Thank you!`;

    const url = `https://wa.me/${phoneTarget}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setOfferModalItem(null);
  };

  return (
    <div>
      <SEO
        title="Ogere Remo Community Marketplace"
        description="Buy farm-fresh produce, traditional Adire textiles, Yoruba delicacies, artisan services, and building materials directly from verified Ogere traders."
      />
      <Hero
        ey="Local Economy & Trade"
        ti="Ogere Marketplace"
        sub="Discover authentic goods, harvest produce, traditional arts, and verified services from the sons and daughters of Ogereland."
        dark
      />

      {/* Community Banner */}
      <div style={{ background: 'linear-gradient(90deg, #1a0d06, #2c1500, #1a0d06)', padding: '0.7rem 2rem', textAlign: 'center', borderBottom: '1px solid rgba(201,150,58,0.2)' }}>
        <span className="cinzel" style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: 'rgba(245,237,216,0.85)', textTransform: 'uppercase' }}>
          🛒 {listings.length} VERIFIED COMMUNITY LISTINGS · 100% DIRECT SELLER CONTACT · ZERO INTERMEDIARY COMMISSIONS
        </span>
      </div>

      <Section bg="#0d0704" py="3.5rem">
        {/* Marketplace Summary Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2.5rem', textAlign: 'center' }}>
          {[
            { ic: '🌾', l: 'Farm Produce', n: listings.filter(l => l.cat === 'Farm Produce').length },
            { ic: '🪡', l: 'Crafts & Adire', n: listings.filter(l => l.cat === 'Crafts & Adire').length },
            { ic: '🍲', l: 'Food & Catering', n: listings.filter(l => l.cat === 'Food & Catering').length },
            { ic: '⚡', l: 'Artisan Services', n: listings.filter(l => l.cat === 'Services').length },
            { ic: '🏗️', l: 'Trade & Retail', n: listings.filter(l => l.cat === 'Trade & Retail').length },
            { ic: '🛡️', l: 'Verified Sellers', n: listings.filter(l => l.verified).length },
          ].map(stat => (
            <div key={stat.l} className="glass" style={{ padding: '1rem', borderRadius: '10px', border: '1px solid rgba(201,150,58,0.15)' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>{stat.ic}</div>
              <div className="cinzel" style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--gold)' }}>{stat.n}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(245,237,216,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.l}</div>
            </div>
          ))}
        </div>

        {/* Search & Comprehensive Filters Bar */}
        <div
          className="glass"
          style={{
            padding: '1.2rem 1.5rem',
            borderRadius: '14px',
            marginBottom: '2rem',
            border: '1px solid rgba(201,150,58,0.25)',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Keyword search input */}
            <div style={{ flex: 2, minWidth: 'min(240px, 100%)', position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', opacity: 0.5 }}>🔍</span>
              <input
                className="inp"
                style={{ paddingLeft: '2.5rem', width: '100%', borderRadius: '30px' }}
                placeholder="Search produce, Adire, electrician, yam, caterer..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Quarter filter dropdown */}
            <div style={{ flex: 1, minWidth: '160px' }}>
              <select
                className="inp"
                style={{ borderRadius: '30px', background: '#1a0d06', padding: '0.6rem 1rem' }}
                value={selectedQuarter}
                onChange={e => setSelectedQuarter(e.target.value)}
              >
                {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div style={{ flex: 1, minWidth: '150px' }}>
              <select
                className="inp"
                style={{ borderRadius: '30px', background: '#1a0d06', padding: '0.6rem 1rem' }}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="newest">📅 Newest First</option>
                <option value="verified">🛡️ Verified Sellers First</option>
              </select>
            </div>

            {/* Action buttons (Post Listing + Saved) */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowOnlyFavs(!showOnlyFavs)}
                className={`abtn ${showOnlyFavs ? 'abtn-p' : 'abtn-o'}`}
                style={{ borderRadius: '30px', padding: '0.6rem 1.2rem', fontSize: '0.65rem' }}
              >
                ❤️ Saved ({savedFavorites.length})
              </button>

              <button
                onClick={() => setShowForm(true)}
                className="btn-p"
                style={{ borderRadius: '30px', padding: '0.6rem 1.4rem', fontSize: '0.65rem' }}
              >
                + Post Free Listing
              </button>
            </div>
          </div>

          {/* Category filter pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(201,150,58,0.1)' }}>
            {CATEGORIES.map(cat => {
              const active = activeCategory === cat.id;
              const count = cat.id === 'All' ? listings.length : listings.filter(l => l.cat === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease',
                    background: active ? 'var(--gold)' : 'rgba(201,150,58,0.06)',
                    color: active ? 'var(--darker)' : 'rgba(245,237,216,0.7)',
                    border: active ? 'none' : '1px solid rgba(201,150,58,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span style={{ opacity: 0.6, fontSize: '0.52rem' }}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div style={{ color: 'rgba(245,237,216,0.6)', fontSize: '0.82rem' }}>
            Showing <strong style={{ color: 'var(--gold)' }}>{filteredListings.length}</strong> items in{' '}
            <strong style={{ color: 'var(--cream)' }}>{activeCategory}</strong>
            {selectedQuarter !== 'All Quarters' && <span> in <em>{selectedQuarter}</em></span>}
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.75rem', color: 'rgba(245,237,216,0.8)' }}>
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={e => setOnlyVerified(e.target.checked)}
                style={{ accentColor: 'var(--gold)' }}
              />
              🛡️ Verified sellers only
            </label>
          </div>
        </div>

        {/* Marketplace Grid */}
        {filteredListings.length === 0 ? (
          <div
            className="glass"
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              borderRadius: '16px',
              border: '1px dashed rgba(201,150,58,0.3)',
              marginBottom: '3rem',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h3 className="playfair" style={{ fontSize: '1.8rem', color: 'var(--cream)', marginBottom: '0.6rem' }}>
              No Listings Found Matching Your Criteria
            </h3>
            <p style={{ color: 'rgba(245,237,216,0.6)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
              Try searching with broader keywords, selecting all categories, or be the first to list this product or service!
            </p>
            <button
              className="btn-p"
              onClick={() => {
                setActiveCategory('All');
                setSelectedQuarter('All Quarters');
                setSearchQuery('');
                setShowOnlyFavs(false);
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(290px, 100%), 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
            {filteredListings.map(item => {
              const isFav = savedFavorites.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="glass card"
                  style={{
                    borderRadius: '14px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(201,150,58,0.18)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {/* Top Thumbnail Image / Icon Banner */}
                  <div
                    style={{
                      height: '160px',
                      background: 'linear-gradient(135deg, #1c1008, #2a150a)',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      borderBottom: '1px solid rgba(201,150,58,0.12)',
                    }}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ fontSize: '4.5rem', opacity: 0.9 }}>{item.icon || '🛍️'}</div>
                    )}

                    {/* Floating Badges */}
                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.52rem',
                          background: (BADGE_COLORS[item.badge] || '#C9963A') + '30',
                          color: BADGE_COLORS[item.badge] || 'var(--gold)',
                          border: `1px solid ${BADGE_COLORS[item.badge] || 'var(--gold)'}70`,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontFamily: 'var(--font-display)',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        {item.badge || 'local'}
                      </span>

                      {item.verified && (
                        <span
                          style={{
                            fontSize: '0.52rem',
                            background: 'rgba(22,163,74,0.3)',
                            color: '#86efac',
                            border: '1px solid rgba(22,163,74,0.6)',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontFamily: 'var(--font-display)',
                            letterSpacing: '0.08em',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          🛡️ Verified
                        </span>
                      )}
                    </div>

                    {/* Top Action Buttons (Bookmark & Share) */}
                    <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '0.3rem' }}>
                      <button
                        onClick={(e) => handleShare(item, e)}
                        title="Share listing"
                        style={{
                          background: 'rgba(0,0,0,0.6)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                        }}
                      >
                        {copiedId === item.id ? '✓' : '🔗'}
                      </button>

                      <button
                        onClick={(e) => toggleFavorite(item.id, e)}
                        title="Save to favorites"
                        style={{
                          background: isFav ? '#dc2626' : 'rgba(0,0,0,0.6)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                        }}
                      >
                        {isFav ? '❤️' : '🤍'}
                      </button>
                    </div>

                    {/* Stock Status Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.75)',
                        border: '1px solid rgba(201,150,58,0.2)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.62rem',
                        color: 'rgba(245,237,216,0.9)',
                      }}
                    >
                      {item.stockStatus || 'Available Now'}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div style={{ padding: '1.2rem 1.4rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {item.cat}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(245,237,216,0.45)' }}>
                        📍 {item.quarter}
                      </span>
                    </div>

                    <h4
                      className="playfair"
                      style={{
                        fontSize: '1.15rem',
                        color: 'var(--cream)',
                        marginBottom: '0.5rem',
                        lineHeight: 1.35,
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedItem(item)}
                    >
                      {item.title}
                    </h4>

                    <p style={{ fontSize: '0.8rem', color: 'rgba(245,237,216,0.65)', lineHeight: 1.6, marginBottom: '1.2rem', flex: 1 }}>
                      {item.desc?.length > 95 ? item.desc.substring(0, 95) + '…' : item.desc}
                    </p>

                    {/* Price and Negotiable indicator */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', borderTop: '1px solid rgba(201,150,58,0.1)', paddingTop: '0.8rem' }}>
                      <div>
                        <div className="cinzel" style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--gold)' }}>
                          {item.price}
                        </div>
                        {item.isNegotiable && (
                          <div style={{ fontSize: '0.6rem', color: '#86efac' }}>💬 Price Negotiable</div>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(245,237,216,0.5)', textAlign: 'right' }}>
                        👤 {item.seller}
                      </div>
                    </div>

                    {/* Buyer Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button
                        className="btn-p"
                        style={{
                          fontSize: '0.68rem',
                          padding: '0.6rem',
                          background: '#25D366',
                          borderColor: '#22c55e',
                          color: '#0d0704',
                          fontWeight: 'bold',
                        }}
                        onClick={() => setOrderModalItem(item)}
                      >
                        ⚡ Order on WhatsApp
                      </button>

                      <button
                        className="btn-o"
                        style={{ fontSize: '0.68rem', padding: '0.6rem' }}
                        onClick={() => setSelectedItem(item)}
                      >
                        🔍 View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Safety & Fair Trade Notice */}
        <div
          className="glass"
          style={{
            padding: '1.8rem 2rem',
            borderRadius: '14px',
            borderLeft: '4px solid var(--gold)',
            marginBottom: '3rem',
            background: 'rgba(201,150,58,0.04)',
          }}
        >
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '2rem' }}>🛡️</div>
            <div style={{ flex: 1 }}>
              <div className="cinzel" style={{ fontSize: '0.85rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                OGERE COMMUNITY MARKETPLACE SAFETY GUIDELINES
              </div>
              <p style={{ color: 'rgba(245,237,216,0.7)', fontSize: '0.82rem', lineHeight: 1.7, margin: 0 }}>
                • For physical goods, exchange payments only upon physical inspection or pickup at designated central locations such as <strong>Ogere Town Hall</strong>, <strong>Palace Square</strong>, or <strong>Oja Ale Centre</strong>.<br />
                • Look for the <strong>🛡️ Verified</strong> badge confirming active registration with the Ogere Community Development Association.<br />
                • For diaspora bulk orders, communicate directly via WhatsApp to agree on shipping logistics.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass"
            style={{
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '16px',
              borderTop: '4px solid var(--gold)',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              animation: 'fadeUp 0.3s ease both',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
              <div>
                <span className="cinzel" style={{ fontSize: '0.62rem', color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  {selectedItem.cat} · {selectedItem.quarter}
                </span>
                <h3 className="playfair" style={{ fontSize: '1.8rem', color: 'var(--cream)', marginTop: '0.2rem' }}>
                  {selectedItem.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                style={{ background: 'none', border: 'none', color: 'rgba(245,237,216,0.6)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {selectedItem.imageUrl && (
              <div style={{ borderRadius: '10px', overflow: 'hidden', maxHeight: '280px', marginBottom: '1.5rem' }}>
                <img src={selectedItem.imageUrl} alt={selectedItem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', background: 'rgba(201,150,58,0.06)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
              <div>
                <div className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)' }}>PRICE</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--cream)' }}>{selectedItem.price}</div>
              </div>
              <div>
                <div className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)' }}>SELLER</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--cream)' }}>{selectedItem.seller}</div>
              </div>
              <div>
                <div className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)' }}>STATUS</div>
                <div style={{ fontSize: '0.85rem', color: '#86efac' }}>{selectedItem.stockStatus || 'In Stock'}</div>
              </div>
              <div>
                <div className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)' }}>LOCATION</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--cream)' }}>📍 {selectedItem.quarter}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div className="cinzel" style={{ fontSize: '0.62rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Full Description & Details
              </div>
              <p style={{ fontSize: '0.88rem', color: 'rgba(245,237,216,0.8)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
                {selectedItem.desc}
              </p>
            </div>

            {/* Direct contact & ordering action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.8rem', borderTop: '1px solid rgba(201,150,58,0.2)', paddingTop: '1.2rem' }}>
              <button
                className="btn-p"
                style={{ background: '#25D366', borderColor: '#22c55e', color: '#0d0704', fontWeight: 'bold' }}
                onClick={() => {
                  setSelectedItem(null);
                  setOrderModalItem(selectedItem);
                }}
              >
                ⚡ Place Order via WhatsApp
              </button>

              <button
                className="btn-o"
                onClick={() => {
                  setSelectedItem(null);
                  setOfferModalItem(selectedItem);
                }}
              >
                💬 Negotiate Price
              </button>

              <a
                href={`tel:${selectedItem.phone}`}
                className="btn-o"
                style={{ textAlign: 'center', textDecoration: 'none' }}
              >
                📞 Call {selectedItem.phone}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Quick WhatsApp Order Modal */}
      {orderModalItem && (
        <div
          onClick={() => setOrderModalItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass"
            style={{
              maxWidth: '500px',
              width: '100%',
              borderRadius: '16px',
              borderTop: '4px solid #25D366',
              padding: '2rem',
              animation: 'fadeUp 0.3s ease both',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 className="playfair" style={{ fontSize: '1.5rem', color: 'var(--cream)' }}>
                ⚡ Quick WhatsApp Order
              </h3>
              <button onClick={() => setOrderModalItem(null)} style={{ background: 'none', border: 'none', color: 'rgba(245,237,216,0.6)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: '0.8rem', background: 'rgba(37,211,102,0.08)', borderRadius: '8px', border: '1px solid rgba(37,211,102,0.3)', marginBottom: '1.2rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--cream)', fontWeight: 'bold' }}>{orderModalItem.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--gold)' }}>Listed at: {orderModalItem.price} · Seller: {orderModalItem.seller}</div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendWhatsAppOrder(orderModalItem, orderForm);
              }}
              style={{ display: 'grid', gap: '1rem' }}
            >
              <div>
                <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Your Full Name *</label>
                <input required className="inp" value={orderForm.buyerName} onChange={e => setOrderForm({ ...orderForm, buyerName: e.target.value })} placeholder="E.g. Biodun Adeleke" />
              </div>
              <div>
                <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Quantity / Units *</label>
                <input required className="inp" value={orderForm.quantity} onChange={e => setOrderForm({ ...orderForm, quantity: e.target.value })} placeholder="E.g. 3 tubers / 2 sets / 1 bag" />
              </div>
              <div>
                <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Delivery / Pickup Location in Ogere *</label>
                <input required className="inp" value={orderForm.address} onChange={e => setOrderForm({ ...orderForm, address: e.target.value })} placeholder="E.g. Oke-Ogere, near Town Hall" />
              </div>
              <div>
                <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Special Note (Optional)</label>
                <input className="inp" value={orderForm.note} onChange={e => setOrderForm({ ...orderForm, note: e.target.value })} placeholder="E.g. Please deliver before 4 PM" />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn-o" onClick={() => setOrderModalItem(null)}>Cancel</button>
                <button type="submit" className="btn-p" style={{ background: '#25D366', borderColor: '#22c55e', color: '#0d0704', fontWeight: 'bold' }}>
                  💬 Open in WhatsApp →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Negotiate / Price Offer Modal */}
      {offerModalItem && (
        <div
          onClick={() => setOfferModalItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass"
            style={{
              maxWidth: '440px',
              width: '100%',
              borderRadius: '16px',
              borderTop: '4px solid var(--gold)',
              padding: '2rem',
              animation: 'fadeUp 0.3s ease both',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 className="playfair" style={{ fontSize: '1.4rem', color: 'var(--cream)' }}>
                💬 Make a Price Offer
              </h3>
              <button onClick={() => setOfferModalItem(null)} style={{ background: 'none', border: 'none', color: 'rgba(245,237,216,0.6)', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: '0.8rem', background: 'rgba(201,150,58,0.08)', borderRadius: '8px', marginBottom: '1.2rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--cream)', fontWeight: 'bold' }}>{offerModalItem.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--gold)' }}>Asking Price: {offerModalItem.price}</div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendWhatsAppOffer(offerModalItem, offerAmount);
              }}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>
                  Your Offer Amount (₦) *
                </label>
                <input
                  required
                  type="number"
                  className="inp"
                  value={offerAmount}
                  onChange={e => setOfferAmount(e.target.value)}
                  placeholder="E.g. 15000"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-o" onClick={() => setOfferModalItem(null)}>Cancel</button>
                <button type="submit" className="btn-p" style={{ background: '#25D366', borderColor: '#22c55e', color: '#0d0704', fontWeight: 'bold' }}>
                  💬 Send Offer via WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Listing Modal */}
      {showForm && (
        <div
          onClick={() => setShowForm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass"
            style={{
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '16px',
              borderTop: '4px solid var(--gold)',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              animation: 'fadeUp 0.3s ease both',
            }}
          >
            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
                <h3 className="playfair" style={{ fontSize: '2rem', color: 'var(--cream)', marginBottom: '0.6rem' }}>
                  Listing Published Successfully!
                </h3>
                <p style={{ color: 'rgba(245,237,216,0.7)', fontSize: '0.9rem' }}>
                  Your listing is now live in the Ogere Community Marketplace and discoverable by community members and diaspora buyers.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 className="playfair" style={{ fontSize: '1.8rem', color: 'var(--cream)' }}>
                      Post Free Marketplace Listing
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(245,237,216,0.5)', margin: 0 }}>
                      Reach local buyers in Ogere and diaspora members worldwide.
                    </p>
                  </div>
                  <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(245,237,216,0.6)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '1.2rem', marginBottom: '1.5rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Product / Service Title *</label>
                    <input required className="inp" value={newForm.title} onChange={e => setNewForm({ ...newForm, title: e.target.value })} placeholder="E.g. Fresh Ogere Yam Tubers, Hand-dyed Adire Aso-Oke..." />
                  </div>

                  <div>
                    <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Category *</label>
                    <select required className="inp" value={newForm.category} onChange={e => setNewForm({ ...newForm, category: e.target.value })} style={{ background: '#1a0d06' }}>
                      {CATEGORIES.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Quarter / Sector in Ogere *</label>
                    <select required className="inp" value={newForm.quarter} onChange={e => setNewForm({ ...newForm, quarter: e.target.value })} style={{ background: '#1a0d06' }}>
                      {QUARTERS.slice(1).map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Price (₦) *</label>
                    <input required className="inp" value={newForm.priceNumber} onChange={e => setNewForm({ ...newForm, priceNumber: e.target.value })} placeholder="E.g. 4500 or Quote" />
                  </div>

                  <div>
                    <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Unit of Measure</label>
                    <input className="inp" value={newForm.priceUnit} onChange={e => setNewForm({ ...newForm, priceUnit: e.target.value })} placeholder="E.g. per tuber, per set, per day" />
                  </div>

                  <div>
                    <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Seller / Business Name *</label>
                    <input required className="inp" value={newForm.seller} onChange={e => setNewForm({ ...newForm, seller: e.target.value })} placeholder="E.g. Baba Adewale Farms" />
                  </div>

                  <div>
                    <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>WhatsApp / Phone Number *</label>
                    <input required type="tel" className="inp" value={newForm.phone} onChange={e => setNewForm({ ...newForm, phone: e.target.value, whatsapp: e.target.value })} placeholder="0803..." />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Upload Product Photo (Optional)</label>
                    <input type="file" accept="image/*" className="inp" onChange={handleImageUpload} style={{ padding: '0.4rem' }} />
                    {newForm.imageUrl && (
                      <div style={{ marginTop: '0.5rem', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--gold)' }}>
                        <img src={newForm.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', display: 'block', marginBottom: '0.3rem' }}>Detailed Description *</label>
                    <textarea required className="inp" rows={4} value={newForm.desc} onChange={e => setNewForm({ ...newForm, desc: e.target.value })} placeholder="Provide quality details, packaging, sizes, delivery options, etc..." style={{ resize: 'vertical' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-o" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn-p" disabled={loading}>
                    {loading ? 'Publishing…' : '🚀 Publish Listing Now'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <AdireDivider />

      {/* Why Shop Local & Diaspora Link */}
      <Section bg="var(--dark)" py="5rem">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="cinzel" style={{ color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '0.7rem', marginBottom: '1rem' }}>EMPOWERING THE HOMELAND</p>
          <h2 className="playfair" style={{ fontSize: '3rem', color: 'var(--cream)' }}>Why Trade on the Ogere Marketplace?</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {[
            { ic: '🌾', t: 'Farm-Fresh & Authentic', d: 'Direct farm gate and artisan pricing. No exploitative middle-men taking cuts from Ogere farmers and weavers.' },
            { ic: '🌍', t: 'Diaspora Direct Orders', d: 'Sons and daughters abroad in the UK, US, and Canada can arrange food, catering, and home supplies for family in Ogere.' },
            { ic: '🛡️', t: 'Verified Community Trust', d: 'All listings are associated with recognized Ogere compounds and quarters, building community accountability.' },
            { ic: '⚡', t: 'Instant WhatsApp Commerce', d: 'Direct one-tap negotiation and order creation directly into the trader’s WhatsApp without payment gateways holding funds.' },
          ].map(card => (
            <div key={card.t} className="glass card" style={{ padding: '2rem', borderRadius: '14px', borderTop: '3px solid var(--gold)' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{card.ic}</div>
              <div className="cinzel" style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 700, marginBottom: '0.5rem' }}>{card.t}</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(245,237,216,0.65)', lineHeight: 1.7 }}>{card.d}</div>
            </div>
          ))}
        </div>
      </Section>

      <AdireDivider />
    </div>
  );
}
