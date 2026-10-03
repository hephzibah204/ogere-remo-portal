import React from 'react';

export default function SecurityMetricCards({
  codeRedCount,
  activeDispatched,
  totalOpen,
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
      <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #dc2626', borderRadius: '8px', padding: '1.2rem' }}>
        <div className="cinzel" style={{ fontSize: '0.6rem', color: '#fca5a5', letterSpacing: '0.1em' }}>ARMED / TERROR THREATS</div>
        <div className="cinzel" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ef4444', marginTop: '0.2rem' }}>{codeRedCount}</div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>Armed Robbery Â· Terrorism Â· Gunfire</div>
      </div>

      <div style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid #ea580c', borderRadius: '8px', padding: '1.2rem' }}>
        <div className="cinzel" style={{ fontSize: '0.6rem', color: '#fdba74', letterSpacing: '0.1em' }}>ACTIVE PATROL UNITS DISPATCHED</div>
        <div className="cinzel" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f97316', marginTop: '0.2rem' }}>{activeDispatched}</div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>Units en route or on scene</div>
      </div>

      <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid #ca8a04', borderRadius: '8px', padding: '1.2rem' }}>
        <div className="cinzel" style={{ fontSize: '0.6rem', color: '#fde047', letterSpacing: '0.1em' }}>PENDING DISPATCH / OPEN QUEUE</div>
        <div className="cinzel" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#eab308', marginTop: '0.2rem' }}>{totalOpen}</div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>Requires immediate triage</div>
      </div>

      <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid #16a34a', borderRadius: '8px', padding: '1.2rem' }}>
        <div className="cinzel" style={{ fontSize: '0.6rem', color: '#86efac', letterSpacing: '0.1em' }}>COMMUNITY BROADCAST STATUS</div>
        <div className="cinzel" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22c55e', marginTop: '0.6rem' }}>CONNECTED</div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>Live sync with Mobile App SOS</div>
      </div>
    </div>
  );
}
