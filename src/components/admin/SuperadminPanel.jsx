import React, { useState, useEffect } from 'react';
import { dbGetAll, dbUpdate, exportToCSV } from '../../services/db';
import { getSaasConfig, saveSaasConfig, DEFAULT_SAAS_CONFIG } from '../../services/saasConfig';

export default function SuperadminPanel({ addToast, user }) {
  const [activeTab, setActiveTab] = useState('modules'); // modules, identity, monetization, broadcast, rbac, telemetry, batch
  const [saasConfig, setSaasConfig] = useState(getSaasConfig());
  const [dbStatus, setDbStatus] = useState({ connected: true, engine: 'Neon / CockroachDB PostgreSQL', latency: null, checking: false });
  const [counts, setCounts] = useState({
    idCards: 0,
    pendingIdCards: 0,
    royalAudiences: 0,
    pendingAudiences: 0,
    landRegistry: 0,
    pendingLand: 0,
    scholarships: 0,
    marketplace: 0,
    incidents: 0,
    openIncidents: 0,
    donationsTotal: 0,
    donationsCount: 0,
  });

  // Admin users state
  const [adminUsers, setAdminUsers] = useState([
    { id: 'adm-01', username: 'superadmin', name: 'Palace Supreme Admin', role: 'superadmin', email: 'secretariat@ogereremo.ng', active: true },
    { id: 'adm-02', username: 'palace_sec', name: 'HRH Ologere Secretary', role: 'palace_secretary', email: 'palace@ogereremo.ng', active: true },
    { id: 'adm-03', username: 'land_officer', name: 'Ogere Land Registrar', role: 'community_officer', email: 'land@ogereremo.ng', active: true },
    { id: 'adm-04', username: 'security_chief', name: 'Community Security Lead', role: 'security_chief', email: 'security@ogereremo.ng', active: true },
    { id: 'adm-05', username: 'treasury', name: 'Palace Financial Controller', role: 'financial_auditor', email: 'treasury@ogereremo.ng', active: true },
  ]);

  const [newAdmin, setNewAdmin] = useState({ username: '', name: '', role: 'community_officer', email: '', password: '' });
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  // Load telemetry and counts
  const loadTelemetry = async () => {
    try {
      const [ids, auds, lands, schols, mkts, incs, dons] = await Promise.all([
        dbGetAll('id_cards'),
        dbGetAll('royal_audiences'),
        dbGetAll('land_registry'),
        dbGetAll('scholarships'),
        dbGetAll('marketplace'),
        dbGetAll('incident_reports'),
        dbGetAll('donations'),
      ]);

      const idArr = Array.isArray(ids) ? ids : [];
      const audArr = Array.isArray(auds) ? auds : [];
      const landArr = Array.isArray(lands) ? lands : [];
      const scholArr = Array.isArray(schols) ? schols : [];
      const mktArr = Array.isArray(mkts) ? mkts : [];
      const incArr = Array.isArray(incs) ? incs : [];
      const donArr = Array.isArray(dons) ? dons : [];

      const totalDonations = donArr.reduce((acc, curr) => acc + Number(curr.amount || curr.amount_naira || 0), 0);

      setCounts({
        idCards: idArr.length,
        pendingIdCards: idArr.filter(i => i.status === 'pending').length,
        royalAudiences: audArr.length,
        pendingAudiences: audArr.filter(a => a.status === 'pending').length,
        landRegistry: landArr.length,
        pendingLand: landArr.filter(l => l.status === 'Pending Survey' || l.status === 'pending').length,
        scholarships: scholArr.length,
        marketplace: mktArr.length,
        incidents: incArr.length,
        openIncidents: incArr.filter(i => i.status === 'open' || i.status === 'investigating').length,
        donationsTotal: totalDonations,
        donationsCount: donArr.length,
      });
    } catch (err) {
      console.warn('Superadmin telemetry load error:', err);
    }
  };

  useEffect(() => {
    loadTelemetry();
  }, []);

  // Save SaaS Config Handler
  const handleSaveConfig = () => {
    const success = saveSaasConfig(saasConfig);
    if (success) {
      addToast('SaaS Master Configuration updated across the entire website!', 'success');
    } else {
      addToast('Failed to save SaaS configuration.', 'error');
    }
  };

  // Toggle Module Status
  const toggleModule = (moduleKey) => {
    setSaasConfig(prev => {
      const updated = {
        ...prev,
        modules: {
          ...prev.modules,
          [moduleKey]: {
            ...prev.modules[moduleKey],
            enabled: !prev.modules[moduleKey].enabled,
          },
        },
      };
      saveSaasConfig(updated);
      return updated;
    });
    addToast(`Module "${saasConfig.modules[moduleKey].name}" status toggled.`, 'info');
  };

  // Ping Database
  const pingDatabase = async () => {
    setDbStatus(prev => ({ ...prev, checking: true }));
    const startTime = Date.now();
    try {
      const res = await fetch('/api/health');
      const latency = Date.now() - startTime;
      const json = await res.json().catch(() => ({}));
      setDbStatus({
        connected: res.ok && json.database?.connected !== false,
        engine: json.database?.engine || 'Neon / CockroachDB PostgreSQL',
        databaseName: json.database?.databaseName || 'neondb',
        latency: `${latency}ms`,
        checking: false,
      });
      addToast(`Database ping latency: ${latency}ms (Live Cloud Connected)`, 'success');
    } catch {
      const latency = Date.now() - startTime;
      setDbStatus(prev => ({ ...prev, latency: `${latency}ms`, checking: false }));
      addToast(`Database pinged local cache (${latency}ms).`, 'info');
    }
  };

  // Batch Operations
  const handleBatchApproveIds = async () => {
    if (!confirm(`Approve all ${counts.pendingIdCards} pending Citizen ID Card applications?`)) return;
    try {
      const ids = await dbGetAll('id_cards');
      let count = 0;
      for (const item of ids) {
        if (item.status === 'pending') {
          await dbUpdate('id_cards', item.id, { status: 'approved', verifiedBy: 'Superadmin Palace Seal' });
          count++;
        }
      }
      addToast(`Successfully batch-approved ${count} citizen ID card(s).`, 'success');
      loadTelemetry();
    } catch (err) {
      addToast(`Batch approval error: ${err.message}`, 'error');
    }
  };

  const handleBatchConfirmAudiences = async () => {
    if (!confirm(`Confirm all ${counts.pendingAudiences} pending Royal Audience appointments?`)) return;
    try {
      const auds = await dbGetAll('royal_audiences');
      let count = 0;
      for (const item of auds) {
        if (item.status === 'pending') {
          await dbUpdate('royal_audiences', item.id, { status: 'confirmed', palaceNotes: 'Confirmed by Superadmin Secretariat' });
          count++;
        }
      }
      addToast(`Successfully confirmed ${count} Royal Audience booking(s).`, 'success');
      loadTelemetry();
    } catch (err) {
      addToast(`Batch audience error: ${err.message}`, 'error');
    }
  };

  const handleBatchVerifyLand = async () => {
    if (!confirm(`Verify all ${counts.pendingLand} pending Land Registry parcels?`)) return;
    try {
      const lands = await dbGetAll('land_registry');
      let count = 0;
      for (const item of lands) {
        if (item.status === 'Pending Survey' || item.status === 'pending') {
          await dbUpdate('land_registry', item.id, { status: 'Verified' });
          count++;
        }
      }
      addToast(`Successfully verified ${count} Land Registry parcel(s).`, 'success');
      loadTelemetry();
    } catch (err) {
      addToast(`Land verification error: ${err.message}`, 'error');
    }
  };

  // Master Database JSON Export
  const handleExportFullBackup = async () => {
    try {
      const [ids, auds, lands, schols, mkts, incs, dons, blood] = await Promise.all([
        dbGetAll('id_cards'),
        dbGetAll('royal_audiences'),
        dbGetAll('land_registry'),
        dbGetAll('scholarships'),
        dbGetAll('marketplace'),
        dbGetAll('incident_reports'),
        dbGetAll('donations'),
        dbGetAll('blood_donors'),
      ]);

      const backup = {
        metadata: {
          kingdom: saasConfig.identity.kingdomName,
          portalVersion: '6.0.0 (SaaS Superadmin Suite)',
          exportedAt: new Date().toISOString(),
          exportedBy: user?.username || 'superadmin',
          saasConfig,
        },
        collections: {
          id_cards: ids,
          royal_audiences: auds,
          land_registry: lands,
          scholarships: schols,
          marketplace: mkts,
          incident_reports: incs,
          donations: dons,
          blood_donors: blood,
        },
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ogere-saas-master-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Master SaaS system database exported as JSON.', 'success');
    } catch (err) {
      addToast(`Backup export error: ${err.message}`, 'error');
    }
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* SaaS Master Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(201,150,58,.15) 0%, rgba(26,13,6,.95) 100%)',
          border: '1px solid rgba(201,150,58,.3)',
          borderRadius: 8,
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2.5rem' }}>⚡</div>
          <div>
            <div style={{ fontSize: '.65rem', fontFamily: "'Cinzel',serif", letterSpacing: '.18em', color: '#C9963A', textTransform: 'uppercase' }}>
              Master Platform Control Suite
            </div>
            <h1 style={{ color: '#F5EDD8', fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', margin: '.2rem 0' }}>
              SaaS Superadmin Command Center
            </h1>
            <p style={{ color: 'rgba(245,237,216,.6)', fontSize: '.78rem', margin: 0 }}>
              Global control over feature flags, municipal branding, Paystack monetization, database telemetry, and royal administration.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          <button className="abtn abtn-p" onClick={handleSaveConfig} style={{ fontSize: '.72rem', padding: '.45rem .8rem' }}>
            💾 Save All Changes
          </button>
          <button className="abtn abtn-o" onClick={pingDatabase} disabled={dbStatus.checking} style={{ fontSize: '.72rem', padding: '.45rem .8rem' }}>
            {dbStatus.checking ? '⏳ Testing...' : '📡 Ping Database'}
          </button>
          <button className="abtn abtn-o" onClick={handleExportFullBackup} style={{ fontSize: '.72rem', padding: '.45rem .8rem' }}>
            📥 Master JSON Backup
          </button>
        </div>
      </div>

      {/* Superadmin Sub-Navigation Bar */}
      <div style={{ display: 'flex', gap: '.3rem', borderBottom: '1px solid rgba(201,150,58,.18)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'modules', label: '🎛️ Feature Flags & Modules', icon: '🎛️' },
          { id: 'identity', label: '👑 Branding & Identity', icon: '👑' },
          { id: 'broadcast', label: '📢 Sitewide Broadcaster', icon: '📢' },
          { id: 'monetization', label: '💳 Monetization & Paystack', icon: '💳' },
          { id: 'rbac', label: '👥 Multi-Admin & RBAC', icon: '👥' },
          { id: 'batch', label: '⚡ Master Batch Actions', icon: '⚡' },
          { id: 'telemetry', label: '📊 Cloud DB Telemetry', icon: '📊' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '.65rem 1.1rem',
              background: activeTab === tab.id ? 'rgba(201,150,58,.12)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #C9963A' : '2px solid transparent',
              color: activeTab === tab.id ? '#C9963A' : 'rgba(245,237,216,.6)',
              fontSize: '.75rem',
              fontFamily: "'Cinzel',serif",
              letterSpacing: '.05em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '.4rem',
              transition: 'all .15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. FEATURE FLAGS & GLOBAL MODULE TOGGLES */}
      {activeTab === 'modules' && (
        <div style={{ background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.15)', borderRadius: 8, padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.2rem' }}>
            <h3 style={{ color: '#F5EDD8', fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', margin: 0 }}>
              🎛️ Global Module & Feature Flag Switches
            </h3>
            <p style={{ color: 'rgba(245,237,216,.5)', fontSize: '.78rem', margin: '.3rem 0 0' }}>
              Turn individual subsystems on or off instantly across the entire portal without needing to redeploy code.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {Object.entries(saasConfig.modules).map(([key, mod]) => (
              <div
                key={key}
                style={{
                  background: mod.enabled ? 'rgba(201,150,58,.06)' : 'rgba(0,0,0,.3)',
                  border: `1px solid ${mod.enabled ? 'rgba(201,150,58,.25)' : 'rgba(255,255,255,.08)'}`,
                  borderRadius: 6,
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{mod.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.85rem', color: mod.enabled ? '#F5EDD8' : 'rgba(245,237,216,.4)' }}>
                      {mod.name}
                    </div>
                    <div style={{ fontSize: '.65rem', color: mod.enabled ? '#4ade80' : '#f87171', marginTop: '.2rem' }}>
                      {mod.enabled ? '● Active across website' : '○ Disabled (Hidden from public)'}
                    </div>
                  </div>
                </div>

                <button
                  className={mod.enabled ? 'abtn abtn-d' : 'abtn abtn-p'}
                  onClick={() => toggleModule(key)}
                  style={{ fontSize: '.68rem', padding: '.3rem .6rem' }}
                >
                  {mod.enabled ? 'Deactivate' : 'Enable'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. KINGDOM BRANDING & IDENTITY */}
      {activeTab === 'identity' && (
        <div style={{ background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.15)', borderRadius: 8, padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#F5EDD8', fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', margin: 0 }}>
              👑 Kingdom & Tenant Identity Settings
            </h3>
            <p style={{ color: 'rgba(245,237,216,.5)', fontSize: '.78rem', margin: '.3rem 0 0' }}>
              Configure municipal title, reigning royal monarch, official contacts, and sitewide color scheme.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.2rem', maxWidth: 800 }}>
            <div>
              <label style={{ fontSize: '.75rem', color: '#C9963A', display: 'block', marginBottom: '.3rem' }}>Kingdom / Municipality Name</label>
              <input
                className="ainp"
                value={saasConfig.identity.kingdomName}
                onChange={e => setSaasConfig(prev => ({ ...prev, identity: { ...prev.identity, kingdomName: e.target.value } }))}
              />
            </div>

            <div>
              <label style={{ fontSize: '.75rem', color: '#C9963A', display: 'block', marginBottom: '.3rem' }}>Official Motto / Tagline</label>
              <input
                className="ainp"
                value={saasConfig.identity.tagline}
                onChange={e => setSaasConfig(prev => ({ ...prev, identity: { ...prev.identity, tagline: e.target.value } }))}
              />
            </div>

            <div>
              <label style={{ fontSize: '.75rem', color: '#C9963A', display: 'block', marginBottom: '.3rem' }}>Reigning Monarch Full Title</label>
              <input
                className="ainp"
                value={saasConfig.identity.reigningMonarch}
                onChange={e => setSaasConfig(prev => ({ ...prev, identity: { ...prev.identity, reigningMonarch: e.target.value } }))}
              />
            </div>

            <div>
              <label style={{ fontSize: '.75rem', color: '#C9963A', display: 'block', marginBottom: '.3rem' }}>Palace Official Email</label>
              <input
                className="ainp"
                type="email"
                value={saasConfig.identity.officialEmail}
                onChange={e => setSaasConfig(prev => ({ ...prev, identity: { ...prev.identity, officialEmail: e.target.value } }))}
              />
            </div>

            <div>
              <label style={{ fontSize: '.75rem', color: '#C9963A', display: 'block', marginBottom: '.3rem' }}>Community Emergency Hotline</label>
              <input
                className="ainp"
                value={saasConfig.identity.emergencyHotline}
                onChange={e => setSaasConfig(prev => ({ ...prev, identity: { ...prev.identity, emergencyHotline: e.target.value } }))}
              />
            </div>

            <div>
              <label style={{ fontSize: '.75rem', color: '#C9963A', display: 'block', marginBottom: '.3rem' }}>Primary Royal Theme Color</label>
              <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={saasConfig.identity.primaryColor}
                  onChange={e => setSaasConfig(prev => ({ ...prev, identity: { ...prev.identity, primaryColor: e.target.value } }))}
                  style={{ background: 'none', border: 'none', width: 40, height: 35, cursor: 'pointer' }}
                />
                <input
                  className="ainp"
                  value={saasConfig.identity.primaryColor}
                  onChange={e => setSaasConfig(prev => ({ ...prev, identity: { ...prev.identity, primaryColor: e.target.value } }))}
                />
              </div>
            </div>
          </div>

          <button className="abtn abtn-p" onClick={handleSaveConfig} style={{ marginTop: '1.5rem' }}>
            Update Kingdom Identity →
          </button>
        </div>
      )}

      {/* 3. SITEWIDE BROADCASTER */}
      {activeTab === 'broadcast' && (
        <div style={{ background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.15)', borderRadius: 8, padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#F5EDD8', fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', margin: 0 }}>
              📢 Sitewide Emergency & Royal Announcement Manager
            </h3>
            <p style={{ color: 'rgba(245,237,216,.5)', fontSize: '.78rem', margin: '.3rem 0 0' }}>
              Broadcast real-time messages across the top header of every webpage.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '1rem', maxWidth: 650 }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer', fontSize: '.8rem', color: '#F5EDD8' }}>
                <input
                  type="checkbox"
                  checked={saasConfig.broadcast.enabled}
                  onChange={e => setSaasConfig(prev => ({ ...prev, broadcast: { ...prev.broadcast, enabled: e.target.checked } }))}
                />
                <span style={{ fontWeight: 600 }}>Enable Live Announcement Banner across Portal</span>
              </label>
            </div>

            <div>
              <label style={{ fontSize: '.75rem', color: '#C9963A', display: 'block', marginBottom: '.3rem' }}>Banner Theme</label>
              <select
                className="ainp"
                value={saasConfig.broadcast.type}
                onChange={e => setSaasConfig(prev => ({ ...prev, broadcast: { ...prev.broadcast, type: e.target.value } }))}
              >
                <option value="royal">👑 Royal Decree / Palace News (Gold Theme)</option>
                <option value="festival">🎉 Cultural Festival & Lipakala Day (Emerald Theme)</option>
                <option value="alert">🚨 Public Safety / Emergency Advisory (Red Theme)</option>
                <option value="info">ℹ️ Civic Notice (Navy Blue Theme)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '.75rem', color: '#C9963A', display: 'block', marginBottom: '.3rem' }}>Announcement Content</label>
              <textarea
                className="ainp"
                rows={3}
                value={saasConfig.broadcast.message}
                onChange={e => setSaasConfig(prev => ({ ...prev, broadcast: { ...prev.broadcast, message: e.target.value } }))}
                placeholder="Enter sitewide announcement..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem' }}>
              <div>
                <label style={{ fontSize: '.75rem', color: '#C9963A', display: 'block', marginBottom: '.3rem' }}>Action Button Label</label>
                <input
                  className="ainp"
                  value={saasConfig.broadcast.ctaLabel}
                  onChange={e => setSaasConfig(prev => ({ ...prev, broadcast: { ...prev.broadcast, ctaLabel: e.target.value } }))}
                  placeholder="e.g. Learn More"
                />
              </div>
              <div>
                <label style={{ fontSize: '.75rem', color: '#C9963A', display: 'block', marginBottom: '.3rem' }}>Action Link</label>
                <input
                  className="ainp"
                  value={saasConfig.broadcast.ctaLink}
                  onChange={e => setSaasConfig(prev => ({ ...prev, broadcast: { ...prev.broadcast, ctaLink: e.target.value } }))}
                  placeholder="/diaspora"
                />
              </div>
            </div>

            {/* Live Banner Preview */}
            <div style={{ marginTop: '.8rem' }}>
              <div style={{ fontSize: '.68rem', color: 'rgba(245,237,216,.4)', marginBottom: '.3rem' }}>Live Banner Preview:</div>
              <div
                style={{
                  padding: '.7rem 1rem',
                  borderRadius: 4,
                  fontSize: '.78rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '.6rem',
                  background:
                    saasConfig.broadcast.type === 'royal' ? 'rgba(201,150,58,.2)' :
                    saasConfig.broadcast.type === 'festival' ? 'rgba(45,74,34,.3)' :
                    saasConfig.broadcast.type === 'alert' ? 'rgba(181,69,27,.3)' : 'rgba(26,46,94,.3)',
                  border: `1px solid ${
                    saasConfig.broadcast.type === 'royal' ? '#C9963A' :
                    saasConfig.broadcast.type === 'festival' ? '#4ade80' :
                    saasConfig.broadcast.type === 'alert' ? '#f87171' : '#60a5fa'
                  }`,
                  color: '#F5EDD8',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span>{saasConfig.broadcast.type === 'royal' ? '👑' : saasConfig.broadcast.type === 'festival' ? '🎉' : saasConfig.broadcast.type === 'alert' ? '🚨' : 'ℹ️'}</span>
                  <span>{saasConfig.broadcast.message || 'No announcement message entered.'}</span>
                </div>
                {saasConfig.broadcast.ctaLabel && (
                  <span style={{ fontSize: '.7rem', color: '#C9963A', fontWeight: 600, textDecoration: 'underline' }}>
                    {saasConfig.broadcast.ctaLabel} →
                  </span>
                )}
              </div>
            </div>

            <button className="abtn abtn-p" onClick={handleSaveConfig} style={{ marginTop: '1rem', width: 'fit-content' }}>
              Publish Announcement Live →
            </button>
          </div>
        </div>
      )}

      {/* 4. MONETIZATION & PAYSTACK GATEWAY */}
      {activeTab === 'monetization' && (
        <div style={{ background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.15)', borderRadius: 8, padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#F5EDD8', fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', margin: 0 }}>
              💳 SaaS Monetization & Paystack Payment Gateway
            </h3>
            <p style={{ color: 'rgba(245,237,216,.5)', fontSize: '.78rem', margin: '.3rem 0 0' }}>
              Configure payment processing keys and municipal service tariffs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem', maxWidth: 750 }}>
            <div>
              <label style={{ fontSize: '.75rem', color: '#C9963A', display: 'block', marginBottom: '.3rem' }}>Paystack Public Key</label>
              <input
                className="ainp"
                value={saasConfig.payments.paystackPublicKey}
                onChange={e => setSaasConfig(prev => ({ ...prev, payments: { ...prev.payments, paystackPublicKey: e.target.value } }))}
              />
            </div>

            <div>
              <label style={{ fontSize: '.75rem', color: '#C9963A', display: 'block', marginBottom: '.3rem' }}>Digital ID Card Processing Fee (₦)</label>
              <input
                className="ainp"
                type="number"
                value={saasConfig.payments.idCardFeeNaira}
                onChange={e => setSaasConfig(prev => ({ ...prev, payments: { ...prev.payments, idCardFeeNaira: Number(e.target.value) } }))}
              />
            </div>

            <div>
              <label style={{ fontSize: '.75rem', color: '#C9963A', display: 'block', marginBottom: '.3rem' }}>Marketplace Premium Listing Fee (₦)</label>
              <input
                className="ainp"
                type="number"
                value={saasConfig.payments.marketplaceListingFeeNaira}
                onChange={e => setSaasConfig(prev => ({ ...prev, payments: { ...prev.payments, marketplaceListingFeeNaira: Number(e.target.value) } }))}
              />
            </div>

            <div>
              <label style={{ fontSize: '.75rem', color: '#C9963A', display: 'block', marginBottom: '.3rem' }}>Official Land Search Fee (₦)</label>
              <input
                className="ainp"
                type="number"
                value={saasConfig.payments.landSearchFeeNaira}
                onChange={e => setSaasConfig(prev => ({ ...prev, payments: { ...prev.payments, landSearchFeeNaira: Number(e.target.value) } }))}
              />
            </div>
          </div>

          <button className="abtn abtn-p" onClick={handleSaveConfig} style={{ marginTop: '1.5rem' }}>
            Save Monetization Rules →
          </button>
        </div>
      )}

      {/* 5. MULTI-ADMIN & RBAC */}
      {activeTab === 'rbac' && (
        <div style={{ background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.15)', borderRadius: 8, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '.8rem' }}>
            <div>
              <h3 style={{ color: '#F5EDD8', fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', margin: 0 }}>
                👥 Multi-Admin & Palace Staff Permissions (RBAC)
              </h3>
              <p style={{ color: 'rgba(245,237,216,.5)', fontSize: '.78rem', margin: '.3rem 0 0' }}>
                Role-Based Access Control for Palace Secretaries, Land Registrars, Security Chiefs, and Treasury Officers.
              </p>
            </div>
            <button className="abtn abtn-p" onClick={() => setShowAddAdmin(true)} style={{ fontSize: '.72rem' }}>
              + Add Palace Officer
            </button>
          </div>

          {/* Add Admin Form */}
          {showAddAdmin && (
            <form onSubmit={e => {
              e.preventDefault();
              if (!newAdmin.username || !newAdmin.name) return;
              setAdminUsers(prev => [...prev, { id: `adm-${Date.now()}`, ...newAdmin, active: true }]);
              setNewAdmin({ username: '', name: '', role: 'community_officer', email: '', password: '' });
              setShowAddAdmin(false);
              addToast('New admin account created.', 'success');
            }} style={{ background: 'rgba(0,0,0,.4)', border: '1px solid rgba(201,150,58,.2)', borderRadius: 6, padding: '1.2rem', marginBottom: '1.5rem', display: 'grid', gap: '.8rem', maxWidth: 650 }}>
              <div style={{ fontSize: '.85rem', fontWeight: 600, color: '#C9963A' }}>Create Administrative Officer Account</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem' }}>
                <input className="ainp" placeholder="Username" value={newAdmin.username} onChange={e => setNewAdmin(prev => ({ ...prev, username: e.target.value }))} required />
                <input className="ainp" placeholder="Full Officer Name" value={newAdmin.name} onChange={e => setNewAdmin(prev => ({ ...prev, name: e.target.value }))} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem' }}>
                <input className="ainp" type="email" placeholder="Official Email" value={newAdmin.email} onChange={e => setNewAdmin(prev => ({ ...prev, email: e.target.value }))} />
                <select className="ainp" value={newAdmin.role} onChange={e => setNewAdmin(prev => ({ ...prev, role: e.target.value }))}>
                  <option value="superadmin">👑 Superadmin (Full Root Access)</option>
                  <option value="palace_secretary">🏛️ Palace Secretary (Audiences & Kings)</option>
                  <option value="community_officer">📜 Land & ID Card Officer</option>
                  <option value="security_chief">🚨 Security & Emergency Dispatch</option>
                  <option value="financial_auditor">💰 Financial Auditor (Donations & Treasury)</option>
                  <option value="moderator">🛒 Marketplace & Forum Moderator</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '.5rem', marginTop: '.4rem' }}>
                <button type="submit" className="abtn abtn-p" style={{ fontSize: '.7rem' }}>Save Account</button>
                <button type="button" className="abtn abtn-d" onClick={() => setShowAddAdmin(false)} style={{ fontSize: '.7rem' }}>Cancel</button>
              </div>
            </form>
          )}

          {/* Admin Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(201,150,58,.2)', color: '#C9963A', textAlign: 'left' }}>
                  <th style={{ padding: '.7rem .8rem' }}>User / Officer</th>
                  <th style={{ padding: '.7rem .8rem' }}>Assigned SaaS Role</th>
                  <th style={{ padding: '.7rem .8rem' }}>Email</th>
                  <th style={{ padding: '.7rem .8rem' }}>Status</th>
                  <th style={{ padding: '.7rem .8rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map(adm => (
                  <tr key={adm.id} style={{ borderBottom: '1px solid rgba(201,150,58,.08)' }}>
                    <td style={{ padding: '.7rem .8rem' }}>
                      <div style={{ fontWeight: 600, color: '#F5EDD8' }}>{adm.name}</div>
                      <div style={{ fontSize: '.65rem', color: 'rgba(245,237,216,.4)' }}>@{adm.username}</div>
                    </td>
                    <td style={{ padding: '.7rem .8rem' }}>
                      <span className="atag" style={{ padding: '.15rem .45rem', fontSize: '.6rem', background: 'rgba(201,150,58,.1)', border: '1px solid rgba(201,150,58,.3)', color: '#C9963A' }}>
                        {adm.role}
                      </span>
                    </td>
                    <td style={{ padding: '.7rem .8rem', color: 'rgba(245,237,216,.7)' }}>{adm.email}</td>
                    <td style={{ padding: '.7rem .8rem' }}>
                      <span style={{ fontSize: '.68rem', color: adm.active ? '#4ade80' : '#f87171' }}>
                        {adm.active ? '● Active' : '○ Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '.7rem .8rem', textAlign: 'right' }}>
                      <button
                        className="abtn abtn-o"
                        onClick={() => {
                          setAdminUsers(prev => prev.map(a => a.id === adm.id ? { ...a, active: !a.active } : a));
                          addToast('Officer status updated.', 'info');
                        }}
                        style={{ fontSize: '.62rem', padding: '.2rem .5rem' }}
                      >
                        {adm.active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. MASTER BATCH OPERATIONS */}
      {activeTab === 'batch' && (
        <div style={{ background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.15)', borderRadius: 8, padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#F5EDD8', fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', margin: 0 }}>
              ⚡ High-Speed Palace Batch Operations
            </h3>
            <p style={{ color: 'rgba(245,237,216,.5)', fontSize: '.78rem', margin: '.3rem 0 0' }}>
              Execute bulk approvals across all municipal subsystems in a single action.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ border: '1px solid rgba(201,150,58,.15)', borderRadius: 6, padding: '1.2rem', background: 'rgba(0,0,0,.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.6rem' }}>
                <span style={{ fontSize: '1.4rem' }}>🪪</span>
                <div style={{ fontSize: '.9rem', fontWeight: 600, color: '#F5EDD8' }}>Approve All Pending ID Cards</div>
              </div>
              <p style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.4)', marginBottom: '1rem' }}>
                Batch approve all {counts.pendingIdCards} pending citizen identity applications with HRH Palace Seal.
              </p>
              <button
                className="abtn abtn-p"
                onClick={handleBatchApproveIds}
                disabled={counts.pendingIdCards === 0}
                style={{ width: '100%', fontSize: '.75rem' }}
              >
                Approve All Pending ({counts.pendingIdCards}) →
              </button>
            </div>

            <div style={{ border: '1px solid rgba(201,150,58,.15)', borderRadius: 6, padding: '1.2rem', background: 'rgba(0,0,0,.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.6rem' }}>
                <span style={{ fontSize: '1.4rem' }}>👑</span>
                <div style={{ fontSize: '.9rem', fontWeight: 600, color: '#F5EDD8' }}>Confirm All Royal Audiences</div>
              </div>
              <p style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.4)', marginBottom: '1rem' }}>
                Confirm all {counts.pendingAudiences} pending palace audience bookings with His Royal Highness.
              </p>
              <button
                className="abtn abtn-p"
                onClick={handleBatchConfirmAudiences}
                disabled={counts.pendingAudiences === 0}
                style={{ width: '100%', fontSize: '.75rem' }}
              >
                Confirm All Pending ({counts.pendingAudiences}) →
              </button>
            </div>

            <div style={{ border: '1px solid rgba(201,150,58,.15)', borderRadius: 6, padding: '1.2rem', background: 'rgba(0,0,0,.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.6rem' }}>
                <span style={{ fontSize: '1.4rem' }}>📜</span>
                <div style={{ fontSize: '.9rem', fontWeight: 600, color: '#F5EDD8' }}>Verify All Land Parcels</div>
              </div>
              <p style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.4)', marginBottom: '1rem' }}>
                Mark all {counts.pendingLand} unverified land survey plots as verified in the official registry.
              </p>
              <button
                className="abtn abtn-p"
                onClick={handleBatchVerifyLand}
                disabled={counts.pendingLand === 0}
                style={{ width: '100%', fontSize: '.75rem' }}
              >
                Verify All Pending ({counts.pendingLand}) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. CLOUD DATABASE TELEMETRY */}
      {activeTab === 'telemetry' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.2)', borderRadius: 8, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: dbStatus.connected ? '#4ade80' : '#f87171', boxShadow: dbStatus.connected ? '0 0 12px #4ade80' : 'none' }} />
              <div>
                <div style={{ fontSize: '.95rem', fontWeight: 600, color: '#F5EDD8' }}>
                  Target Database: <span style={{ color: '#C9963A' }}>{dbStatus.engine}</span>
                </div>
                <div style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.45)', marginTop: '.2rem' }}>
                  Protocol: PostgreSQL SSL Connection Pooling · Latency: <code style={{ color: '#4ade80' }}>{dbStatus.latency || 'Tested'}</code>
                </div>
              </div>
            </div>
            <button className="abtn abtn-p" onClick={pingDatabase} disabled={dbStatus.checking} style={{ fontSize: '.72rem' }}>
              {dbStatus.checking ? 'Pinging Cloud...' : 'Ping Live Cloud DB'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(26,13,6,.6)', border: '1px solid rgba(201,150,58,.15)', borderRadius: 8, padding: '1.2rem' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '.3rem' }}>🪪</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#F5EDD8' }}>{counts.idCards}</div>
              <div style={{ fontSize: '.7rem', color: '#C9963A', textTransform: 'uppercase' }}>Digital ID Cards</div>
            </div>

            <div style={{ background: 'rgba(26,13,6,.6)', border: '1px solid rgba(201,150,58,.15)', borderRadius: 8, padding: '1.2rem' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '.3rem' }}>👑</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#F5EDD8' }}>{counts.royalAudiences}</div>
              <div style={{ fontSize: '.7rem', color: '#C9963A', textTransform: 'uppercase' }}>Royal Audiences</div>
            </div>

            <div style={{ background: 'rgba(26,13,6,.6)', border: '1px solid rgba(201,150,58,.15)', borderRadius: 8, padding: '1.2rem' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '.3rem' }}>📜</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#F5EDD8' }}>{counts.landRegistry}</div>
              <div style={{ fontSize: '.7rem', color: '#C9963A', textTransform: 'uppercase' }}>Land Registry Plots</div>
            </div>

            <div style={{ background: 'rgba(26,13,6,.6)', border: '1px solid rgba(201,150,58,.15)', borderRadius: 8, padding: '1.2rem' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '.3rem' }}>💰</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#4ade80' }}>
                ₦{Number(counts.donationsTotal || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '.7rem', color: '#C9963A', textTransform: 'uppercase' }}>Total Diaspora Funds</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
