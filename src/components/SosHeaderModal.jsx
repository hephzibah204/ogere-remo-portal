import React from 'react';
import { useNavigate } from 'react-router-dom';

const EMERGENCY_SERVICES = [
  {
    name: 'Ogere Police Post',
    desc: 'Ogun State Police Command',
    phone: '08033456789',
    displayPhone: '0803 345 6789',
    badge: 'Police',
    color: '#3b82f6',
    icon: '👮‍♂️',
  },
  {
    name: 'FRSC Expressway Rescue',
    desc: 'Sagamu / Ogere Corridor Tollgate',
    phone: '122',
    displayPhone: '122 (Toll Free) / 0807 769 0200',
    badge: 'Highway / Crash',
    color: '#ef4444',
    icon: '🚑',
  },
  {
    name: 'So-Safe Corps Ogere Area',
    desc: 'Ogun State Community Security',
    phone: '08029994433',
    displayPhone: '0802 999 4433',
    badge: 'Armed Response',
    color: '#10b981',
    icon: '🛡️',
  },
  {
    name: 'Aafin Ologere Palace Vigilante',
    desc: 'Royal Town Night Watch & Hunters',
    phone: '08145550192',
    displayPhone: '0814 555 0192',
    badge: 'Local Defense',
    color: '#d97706',
    icon: '👑',
  },
];

export default function SosHeaderModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #180907 0%, #0d0604 100%)',
          border: '2px solid #ef4444',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          padding: '1.8rem',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.35)',
          color: '#ffffff',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1.5px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                animation: 'pulseGlow 2s infinite',
              }}
            >
              🚨
            </div>
            <div>
              <h2 className="cinzel" style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#fca5a5' }}>
                OGERE EMERGENCY DISPATCH
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>
                Instant one-tap direct lines to multi-agency security & rescue forces
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Action Buttons: Report Incident or Track Incident */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.4rem' }}>
          <button
            onClick={() => {
              onClose();
              navigate('/alerts');
            }}
            style={{
              background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
              border: '1px solid #f87171',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(185, 28, 28, 0.4)',
            }}
          >
            <span>⚠️</span>
            <span>Report Incident</span>
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/security-dashboard');
            }}
            style={{
              background: 'rgba(201, 150, 58, 0.15)',
              border: '1px solid #d97706',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#fef3c7',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <span>🛡️</span>
            <span>Security Console</span>
          </button>
        </div>

        {/* Emergency Contacts List */}
        <div style={{ display: 'grid', gap: '0.7rem' }}>
          {EMERGENCY_SERVICES.map((serv) => (
            <a
              key={serv.name}
              href={`tel:${serv.phone}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#ffffff',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.borderColor = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.4rem' }}>{serv.icon}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{serv.name}</span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: `${serv.color}25`,
                        color: serv.color,
                        border: `1px solid ${serv.color}50`,
                      }}
                    >
                      {serv.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{serv.desc}</div>
                </div>
              </div>

              <div
                style={{
                  background: '#22c55e',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>📞 Call</span>
              </div>
            </a>
          ))}
        </div>

        {/* Footer Note */}
        <div style={{ marginTop: '1.2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
            🛰️ GPS Location is transmitted automatically during live emergency dispatches.
          </p>
        </div>
      </div>
    </div>
  );
}
