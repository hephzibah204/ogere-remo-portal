import React from 'react';

export default function SecurityDashboardHeader({
  codeRedCount,
  audioEnabled,
  stopAlarm,
  setAudioEnabled,
  triggerAudioAlarm,
  setShowBroadcastModal,
  setShowTipsModal,
  setShowPatrolModal,
}) {
  return (
    <div style={{
      background: codeRedCount > 0 
        ? 'linear-gradient(90deg, #7f1d1d 0%, #b91c1c 50%, #7f1d1d 100%)'
        : 'linear-gradient(90deg, #14532d 0%, #166534 50%, #14532d 100%)',
      animation: codeRedCount > 0 ? 'codeRedFlash 1.4s ease-in-out infinite' : 'none',
      padding: '0.65rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
      borderBottom: '1px solid rgba(255,255,255,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <span style={{
          fontSize: '1.2rem',
          animation: codeRedCount > 0 ? 'sirenPulse 0.7s ease-in-out infinite' : 'none',
          display: 'inline-block',
        }}>
          {codeRedCount > 0 ? 'ðŸš¨' : 'ðŸ›¡ï¸'}
        </span>
        <div>
          <div className="cinzel" style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.12em', color: '#ffffff' }}>
            {codeRedCount > 0 
              ? `CRITICAL ALERT: ${codeRedCount} ACTIVE CODE RED (ARMED ROBBERY / TERRORISM / HOSTAGE)`
              : 'OGERE REMO SECURITY SECTOR STATUS: NORMAL SURVEILLANCE PATROL'}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)' }}>
            Lagos-Ibadan Expressway Corridor Â· Palace Joint Taskforce Unified Dispatch
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        {codeRedCount > 0 && (
          <button
            onClick={() => { stopAlarm(); setAudioEnabled(false); }}
            style={{
              background: '#1e1b4b',
              border: '1px solid #818cf8',
              color: '#a5b4fc',
              padding: '0.35rem 0.85rem',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              letterSpacing: '0.04em',
            }}
          >
            ðŸ”• SILENCE ALARM
          </button>
        )}

        <button
          onClick={() => {
            const next = !audioEnabled;
            setAudioEnabled(next);
            if (next && codeRedCount > 0) triggerAudioAlarm(true);
            if (!next) stopAlarm();
          }}
          style={{
            background: audioEnabled ? '#22c55e' : 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#ffffff',
            padding: '0.35rem 0.75rem',
            borderRadius: '4px',
            fontSize: '0.68rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span>{audioEnabled ? 'ðŸ”” Siren Armed' : 'ðŸ”• Siren Muted'}</span>
        </button>

        <button
          onClick={() => setShowBroadcastModal(true)}
          style={{
            background: '#b45309',
            border: '1px solid #f59e0b',
            color: '#ffffff',
            padding: '0.35rem 0.8rem',
            borderRadius: '4px',
            fontSize: '0.68rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          ðŸ“¢ Palace Amber Alert / Curfew
        </button>

        <button
          onClick={() => setShowTipsModal(true)}
          style={{
            background: '#312e81',
            border: '1px solid #6366f1',
            color: '#ffffff',
            padding: '0.35rem 0.8rem',
            borderRadius: '4px',
            fontSize: '0.68rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          ðŸ•µï¸ Intel Tips ({tips ? tips.length : 0})
        </button>

        <button
          onClick={() => setShowPatrolModal(true)}
          style={{
            background: '#064e3b',
            border: '1px solid #10b981',
            color: '#ffffff',
            padding: '0.35rem 0.8rem',
            borderRadius: '4px',
            fontSize: '0.68rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          ðŸ›¡ï¸ Night Patrol Roster
        </button>

        <button
          onClick={() => setNewIncidentForm(true)}
          style={{
            background: '#b91c1c',
            border: '1px solid #ef4444',
            color: '#ffffff',
            padding: '0.35rem 0.9rem',
            borderRadius: '4px',
            fontSize: '0.68rem',
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: '0.05em',
          }}
        >
          + Log Rapid Tactical Alert
        </button>
      </div>
    </div>
  );
}
