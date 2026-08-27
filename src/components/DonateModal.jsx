import { useState, useEffect } from 'react';

export default function DonateModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyAccountNumber = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('6101307590');
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const whatsappUrl =
    'https://wa.me/2349077780156?text=Hello%20Hephtech%20Multimedia%2C%20I%20would%20like%20to%20support%20and%20donate%20to%20the%20Ogere%20Remo%20Community%20Portal%20project.';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(10, 5, 2, 0.85)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1c0d05 0%, #120803 100%)',
          border: '1px solid rgba(201,150,58,0.4)',
          borderTop: '4px solid var(--gold)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(201,150,58,0.15)',
          position: 'relative',
          color: '#F5EDD8',
          animation: 'fadeUp 0.3s ease',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            background: 'rgba(201,150,58,0.1)',
            border: '1px solid rgba(201,150,58,0.3)',
            color: 'var(--gold)',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>🌟</div>
          <div
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(201,150,58,0.25), rgba(181,69,27,0.3))',
              border: '1px solid var(--gold)',
              borderRadius: '20px',
              padding: '0.35rem 1rem',
              marginBottom: '0.8rem',
            }}
          >
            <span className="cinzel" style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase' }}>
              🇳🇬 Pioneering Nigeria's 1st Digital Town
            </span>
          </div>
          <h2 className="playfair" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: 'var(--cream)', margin: 0, fontWeight: 700 }}>
            Make Ogere Nigeria's 1st Digital Town
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'rgba(240,208,128,0.9)', fontStyle: 'italic', margin: '0.5rem 0 0 0' }}>
            By supporting this project, you are helping Ogere Remo make history as the very first fully digitalized indigenous town in Nigeria!
          </p>
        </div>

        {/* Rationale Box */}
        <div
          style={{
            background: 'rgba(201,150,58,0.06)',
            border: '1px solid rgba(201,150,58,0.2)',
            borderRadius: '10px',
            padding: '1.2rem',
            marginBottom: '1.8rem',
            fontSize: '0.88rem',
            lineHeight: 1.7,
            color: 'rgba(245,237,216,0.85)',
          }}
          className="baskerville"
        >
          <p style={{ margin: '0 0 0.8rem 0' }}>
            To bring this historic vision to life and build a sustainable, world-class municipal digital ecosystem for Ogere Remo, continuous funding is vital to support:
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'grid', gap: '0.35rem', fontSize: '0.84rem' }}>
            <li>💻 <strong>Software Developers & Technical Engineers</strong></li>
            <li>🎨 <strong>UI/UX Designers & Cultural Content Illustrators</strong></li>
            <li>📋 <strong>Project Managers & Community Coordinators</strong></li>
            <li>☁️ <strong>Cloud Server Infrastructure & App Hosting</strong></li>
            <li>🌐 <strong>Enterprise Domain, Web Hosting & Database Systems</strong></li>
            <li>🔒 <strong>Security Updates, Data Backups & 24/7 Uptime</strong></li>
          </ul>
        </div>

        {/* Bank Transfer Details Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(201,150,58,0.12) 0%, rgba(13,7,4,0.7) 100%)',
            border: '1px solid var(--gold)',
            borderRadius: '12px',
            padding: '1.4rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div className="cinzel" style={{ fontSize: '0.62rem', letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            Direct Bank Transfer (Nigeria)
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="cinzel" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--cream)', letterSpacing: '0.08em' }}>
              6101307590
            </span>
          </div>

          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.2rem' }}>
            Opay
          </div>
          <div className="cinzel" style={{ fontSize: '0.75rem', color: 'rgba(245,237,216,0.75)', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            Hephtech Multimedia & Innovations
          </div>

          <button
            onClick={copyAccountNumber}
            className="btn-p"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {copied ? '✓ Account Number Copied to Clipboard!' : '📋 Copy Opay Account (6101307590)'}
          </button>
        </div>

        {/* Direct Contact / WhatsApp Channels */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(201,150,58,0.2)',
            borderRadius: '12px',
            padding: '1.2rem',
            marginBottom: '1.8rem',
            textAlign: 'center',
          }}
        >
          <div className="cinzel" style={{ fontSize: '0.62rem', letterSpacing: '0.12em', color: 'rgba(245,237,216,0.6)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            Direct Donation Enquiries & Sponsorships
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="tel:09077780156"
              className="btn-o"
              style={{
                fontSize: '0.75rem',
                padding: '0.65rem 1.2rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              📞 Call 09077780156
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-p"
              style={{
                fontSize: '0.75rem',
                padding: '0.65rem 1.2rem',
                background: '#16a34a',
                borderColor: '#22c55e',
                color: '#fff',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              💬 WhatsApp Us
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'rgba(245,237,216,0.5)', fontStyle: 'italic' }}>
          &ldquo;Àjọṣe wa kò ní bàjẹ́! Thank you for empowering the preservation and digital advancement of Ogere Remo.&rdquo;
        </div>
      </div>
    </div>
  );
}
