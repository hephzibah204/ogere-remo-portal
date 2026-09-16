import React, { useState, useEffect } from 'react';
import { getSafePin, getDuressPin, setSafePin as persistSafePin, setDuressPin as persistDuressPin } from '../utils/pinStorage';

/**
 * DuressPinSettings
 * Inline settings card for configuring the citizen's Safe Arrival PIN
 * and Covert Duress PIN. Validates that both are 4-digit numbers and
 * that they are not the same.
 *
 * Props:
 *  - onClose: () => void — called when the user taps the close/back button
 *  - onSave: (safePin, duressPin) => void — optional callback after successful save
 */
export default function DuressPinSettings({ onClose, onSave }) {
  const [safePin, setSafePin] = useState('');
  const [duressPin, setDuressPin] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSafePin(getSafePin());
    setDuressPin(getDuressPin());
  }, []);

  const isValidPin = (pin) => /^\d{4}$/.test(pin);

  const handleSave = () => {
    setError('');
    setSaved(false);

    if (!isValidPin(safePin)) {
      setError('Safe Arrival PIN must be exactly 4 digits.');
      return;
    }
    if (!isValidPin(duressPin)) {
      setError('Duress PIN must be exactly 4 digits.');
      return;
    }
    if (safePin === duressPin) {
      setError('Duress PIN cannot be the same as your Safe Arrival PIN.');
      return;
    }

    persistSafePin(safePin);
    persistDuressPin(duressPin);
    setSaved(true);
    if (onSave) onSave(safePin, duressPin);

    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {/* Header */}
      <div style={{ background: '#0f172a', padding: '14px', borderRadius: '14px', color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🔐</div>
        <div style={{ fontSize: '0.88rem', fontWeight: 900 }}>Security PIN Configuration</div>
        <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: '2px' }}>
          Set your Safe Arrival & Covert Duress PINs
        </div>
      </div>

      {/* Error / Success banners */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          padding: '8px 10px',
          borderRadius: '8px',
          fontSize: '0.68rem',
          color: '#991b1b',
          fontWeight: 700,
        }}>
          ⚠️ {error}
        </div>
      )}
      {saved && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #86efac',
          padding: '8px 10px',
          borderRadius: '8px',
          fontSize: '0.68rem',
          color: '#065f46',
          fontWeight: 700,
        }}>
          ✅ PINs saved successfully. Changes take effect immediately.
        </div>
      )}

      {/* Safe PIN */}
      <div style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#064e3b', marginBottom: '4px' }}>
          🛡️ Safe Arrival PIN
        </div>
        <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: '6px' }}>
          Enter this PIN to confirm you arrived safely. Your escort session will end normally.
        </div>
        <input
          type="password"
          maxLength={4}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="e.g. 2468"
          value={safePin}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
            setSafePin(val);
            setError('');
          }}
          style={{
            width: '100%',
            textAlign: 'center',
            fontSize: '1.4rem',
            letterSpacing: '10px',
            padding: '8px',
            borderRadius: '8px',
            border: '2px solid #059669',
            background: '#f0fdf4',
            color: '#064e3b',
            fontWeight: 900,
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Duress PIN */}
      <div style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #fca5a5' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#991b1b', marginBottom: '4px' }}>
          🚨 Covert Duress PIN
        </div>
        <div style={{ fontSize: '0.6rem', color: '#64748b', marginBottom: '6px' }}>
          If forced by an attacker to cancel your escort, enter this PIN instead. It will
          <strong> silently alert police & SWAT</strong> while pretending the session ended peacefully on your screen.
        </div>
        <input
          type="password"
          maxLength={4}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Default: 9999"
          value={duressPin}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
            setDuressPin(val);
            setError('');
          }}
          style={{
            width: '100%',
            textAlign: 'center',
            fontSize: '1.4rem',
            letterSpacing: '10px',
            padding: '8px',
            borderRadius: '8px',
            border: '2px solid #dc2626',
            background: '#fef2f2',
            color: '#991b1b',
            fontWeight: 900,
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Rules / Info */}
      <div style={{
        background: '#fffbeb',
        border: '1px solid #fbbf24',
        padding: '8px 10px',
        borderRadius: '8px',
        fontSize: '0.6rem',
        color: '#78350f',
        lineHeight: 1.5,
      }}>
        <strong>🔑 Rules:</strong>
        <ul style={{ margin: '4px 0 0', paddingLeft: '16px' }}>
          <li>Both PINs must be exactly <strong>4 digits</strong>.</li>
          <li>Safe PIN and Duress PIN <strong>must be different</strong>.</li>
          <li>If you haven't set a Duress PIN, <strong>9999</strong> is used by default.</li>
          <li>Never share your Duress PIN with anyone.</li>
        </ul>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleSave}
          style={{
            flex: 1,
            background: '#064e3b',
            color: '#fff',
            border: 'none',
            padding: '10px',
            borderRadius: '8px',
            fontWeight: 900,
            fontSize: '0.78rem',
            cursor: 'pointer',
          }}
        >
          💾 Save PINs
        </button>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            color: '#64748b',
            border: '1px solid #cbd5e1',
            padding: '10px 14px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.72rem',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
