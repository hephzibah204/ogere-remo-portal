// src/pages/CustomaryDisputePage.jsx
// Royal Palace Customary Dispute Arbitration System ("Kootu Oba") for Ogere Remo Kingdom

import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import {
  DISPUTE_CATEGORIES,
  PALACE_ARBITRATORS,
  getCustomaryDisputes,
  fileCustomaryDispute,
  updateDisputeStatus,
} from '../services/customaryDisputeService';

export default function CustomaryDisputePage() {
  const [disputes, setDisputes] = useState(() => getCustomaryDisputes());
  const [activeTab, setActiveTab] = useState('cases'); // 'cases', 'file', 'bench', 'charter'
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDecreeModal, setShowDecreeModal] = useState(false);
  const [decreeCase, setDecreeCase] = useState(null);

  // New dispute form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'land_boundary',
    complainantName: '',
    complainantPhone: '',
    complainantCompound: '',
    complainantQuarter: 'Oke-Ogere',
    respondentName: '',
    respondentPhone: '',
    respondentCompound: '',
    respondentQuarter: 'Isale-Ogere',
    location: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  useEffect(() => {
    const handleUpdate = () => {
      setDisputes(getCustomaryDisputes());
    };
    window.addEventListener('ogere-dispute-updated', handleUpdate);
    return () => window.removeEventListener('ogere-dispute-updated', handleUpdate);
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = fileCustomaryDispute(formData);
      setSubmitSuccess(created);
      setFormData({
        title: '',
        category: 'land_boundary',
        complainantName: '',
        complainantPhone: '',
        complainantCompound: '',
        complainantQuarter: 'Oke-Ogere',
        respondentName: '',
        respondentPhone: '',
        respondentCompound: '',
        respondentQuarter: 'Isale-Ogere',
        location: '',
        description: '',
      });
      setDisputes(getCustomaryDisputes());
    } catch (err) {
      alert('Error filing dispute: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDisputes = disputes.filter((d) => {
    const matchCat = filterCategory === 'all' || d.category === filterCategory;
    const matchStat = filterStatus === 'all' || d.status === filterStatus;
    const matchQuery =
      searchQuery.trim() === '' ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.complainant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.respondent.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchStat && matchQuery;
  });

  const stats = {
    total: disputes.length,
    hearings: disputes.filter((d) => d.status === 'HEARING_SCHEDULED').length,
    decrees: disputes.filter((d) => d.status === 'DECREE_ISSUED').length,
    inReview: disputes.filter((d) => d.status === 'UNDER_REVIEW').length,
  };

  return (
    <div>
      <SEO
        title="Royal Customary Dispute Arbitration (Kootu Oba) — Ogere Remo Kingdom"
        description="Official customary arbitration and peaceful dispute resolution under the authority of HRH Ologere of Ogere and the High Chiefs Council."
      />

      <PageHero
        title="Royal Customary Dispute Arbitration"
        subtitle="Kootu Oba & Peace Tribunal — Traditional Justice, Land Boundary & Estate Mediation under HRH Ologere"
        badge="⚖️ PALACE JUDICIAL BENCH"
        badgeColor="#C9963A"
      />

      <Section>
        {/* Metric Summary Ribbon */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(201, 150, 58, 0.1)', border: '1px solid rgba(201, 150, 58, 0.3)', borderRadius: '8px', padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gold)' }}>{stats.total}</div>
            <div style={{ fontSize: '0.75rem', color: '#f5edd8', fontWeight: 700 }}>TOTAL DISPUTES FILED</div>
          </div>
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8' }}>{stats.hearings}</div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700 }}>SCHEDULED HEARINGS</div>
          </div>
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#4ade80' }}>{stats.decrees}</div>
            <div style={{ fontSize: '0.75rem', color: '#bbf7d0', fontWeight: 700 }}>ROYAL DECREES ISSUED</div>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b' }}>5</div>
            <div style={{ fontSize: '0.75rem', color: '#fde68a', fontWeight: 700 }}>HIGH ARBITRATORS ON BENCH</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(201, 150, 58, 0.3)', paddingBottom: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { id: 'cases', label: '📋 Active Dispute Dossiers', icon: '⚖️' },
            { id: 'file', label: '✍️ File a Customary Dispute', icon: '📜' },
            { id: 'bench', label: '👑 Palace Judicial Bench', icon: '🏛️' },
            { id: 'charter', label: '📖 Customary Law Charter', icon: '🕊️' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setSubmitSuccess(null);
              }}
              style={{
                background: activeTab === tab.id ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab.id ? '#000000' : '#f5edd8',
                border: activeTab === tab.id ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                padding: '0.6rem 1.2rem',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: ACTIVE DISPUTE DOSSIERS */}
        {activeTab === 'cases' && (
          <div>
            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dispute title, Case ID, or party names..."
                style={{
                  flex: 1,
                  minWidth: '240px',
                  background: '#120804',
                  color: '#fff',
                  border: '1px solid rgba(201,150,58,0.3)',
                  borderRadius: '6px',
                  padding: '0.6rem 1rem',
                  fontSize: '0.85rem',
                }}
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  background: '#120804',
                  color: '#f5edd8',
                  border: '1px solid rgba(201,150,58,0.3)',
                  borderRadius: '6px',
                  padding: '0.6rem 0.8rem',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">All Categories</option>
                {DISPUTE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  background: '#120804',
                  color: '#f5edd8',
                  border: '1px solid rgba(201,150,58,0.3)',
                  borderRadius: '6px',
                  padding: '0.6rem 0.8rem',
                  fontSize: '0.85rem',
                }}
              >
                <option value="all">All Statuses</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="HEARING_SCHEDULED">Hearing Scheduled</option>
                <option value="DECREE_ISSUED">Decree Issued</option>
              </select>
            </div>

            {/* Cases Grid */}
            <div style={{ display: 'grid', gap: '1.2rem' }}>
              {filteredDisputes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🕊️</div>
                  <div style={{ fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 800 }}>No Customary Disputes Found</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>There are no disputes matching your selected criteria.</div>
                </div>
              ) : (
                filteredDisputes.map((dispute) => {
                  const isScheduled = dispute.status === 'HEARING_SCHEDULED';
                  const isDecree = dispute.status === 'DECREE_ISSUED';

                  return (
                    <div
                      key={dispute.id}
                      style={{
                        background: 'rgba(20, 10, 5, 0.7)',
                        border: isDecree ? '1px solid #22c55e' : isScheduled ? '1px solid #38bdf8' : '1px solid rgba(201, 150, 58, 0.3)',
                        borderLeft: isDecree ? '6px solid #22c55e' : isScheduled ? '6px solid #38bdf8' : '6px solid var(--gold)',
                        borderRadius: '8px',
                        padding: '1.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.7rem', background: 'rgba(201,150,58,0.2)', color: 'var(--gold)', border: '1px solid rgba(201,150,58,0.4)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                              {dispute.id}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                              Filed {new Date(dispute.filedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 800, margin: 0 }}>
                            {dispute.title}
                          </h3>
                        </div>

                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: isDecree ? 'rgba(34, 197, 94, 0.2)' : isScheduled ? 'rgba(56, 189, 248, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                            color: isDecree ? '#4ade80' : isScheduled ? '#38bdf8' : '#fde047',
                            border: `1px solid ${isDecree ? '#22c55e' : isScheduled ? '#38bdf8' : '#eab308'}`,
                          }}
                        >
                          ● {dispute.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Disputant Parties Card */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800 }}>COMPLAINANT (PARTY A)</div>
                          <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 700 }}>{dispute.complainant.fullName}</div>
                          <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>{dispute.complainant.compound} · {dispute.complainant.quarter}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800 }}>RESPONDENT (PARTY B)</div>
                          <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 700 }}>{dispute.respondent.fullName}</div>
                          <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>{dispute.respondent.compound} · {dispute.respondent.quarter}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800 }}>ASSIGNED ARBITRATOR</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 700 }}>
                            {dispute.assignedArbitrator?.avatar} {dispute.assignedArbitrator?.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>{dispute.assignedArbitrator?.title}</div>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                        {dispute.description}
                      </p>

                      {/* Scheduled Hearing or Issued Decree Info */}
                      {isScheduled && (
                        <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px', padding: '0.75rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800 }}>
                              📅 ARBITRATION HEARING DATE: {dispute.hearingDate} at {dispute.hearingTime}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>
                              📍 Venue: {dispute.hearingVenue}
                            </div>
                          </div>
                          {dispute.virtualLink && (
                            <a
                              href={dispute.virtualLink}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                background: '#0284c7',
                                color: '#fff',
                                textDecoration: 'none',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                              }}
                            >
                              🎥 Join Virtual Chamber ↗
                            </a>
                          )}
                        </div>
                      )}

                      {isDecree && (
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '6px', padding: '0.75rem', marginBottom: '0.75rem' }}>
                          <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 900 }}>
                            📜 ROYAL MEDIATION DECREE FINALIZED (Seal: {dispute.decreeSealNumber})
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#f8fafc', marginTop: '0.2rem' }}>
                            "{dispute.decreeSummary}"
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        {isDecree && (
                          <button
                            type="button"
                            onClick={() => {
                              setDecreeCase(dispute);
                              setShowDecreeModal(true);
                            }}
                            style={{
                              background: '#15803d',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.5rem 1rem',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <span>📜</span> View & Print Royal Decree
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedCase(dispute)}
                          style={{
                            background: 'rgba(255,255,255,0.08)',
                            color: '#f5edd8',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '4px',
                            padding: '0.5rem 1rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          🔍 Full Case Dossier
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FILE A NEW DISPUTE FORM */}
        {activeTab === 'file' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(20, 10, 5, 0.85)', border: '1px solid rgba(201,150,58,0.4)', borderRadius: '10px', padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2rem' }}>⚖️</div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--gold)', margin: '0.4rem 0' }}>
                Petition for Royal Customary Arbitration
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Submit your civil, land, estate, or trade dispute directly to the Aafin Ologere Council of Arbitrators for peaceful customary resolution.
              </p>
            </div>

            {submitSuccess && (
              <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', color: '#4ade80', fontWeight: 900 }}>
                  ✓ Petition Registered Successfully!
                </div>
                <div style={{ fontSize: '0.85rem', color: '#f8fafc', marginTop: '0.3rem' }}>
                  Your case reference is <strong>{submitSuccess.id}</strong>. Assigned to {submitSuccess.assignedArbitrator?.title}.
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>
                  Dispute Title / Subject Matter *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E.g. Demarcation of Boundary between Ile Ologere and Agbole Lisa"
                  style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(201,150,58,0.3)', borderRadius: '4px', padding: '0.65rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>
                  Dispute Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(201,150,58,0.3)', borderRadius: '4px', padding: '0.65rem' }}
                >
                  {DISPUTE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label} — {cat.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Complainant Info */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 900, marginBottom: '0.6rem' }}>
                  1. Complainant (Party A / You)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.complainantName}
                      onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                      placeholder="Chief / Mr. / Mrs."
                      style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.complainantPhone}
                      onChange={(e) => setFormData({ ...formData, complainantPhone: e.target.value })}
                      placeholder="080..."
                      style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Family Compound (Agbole)</label>
                    <input
                      type="text"
                      value={formData.complainantCompound}
                      onChange={(e) => setFormData({ ...formData, complainantCompound: e.target.value })}
                      placeholder="E.g. Agbole Lisa"
                      style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Quarter</label>
                    <select
                      value={formData.complainantQuarter}
                      onChange={(e) => setFormData({ ...formData, complainantQuarter: e.target.value })}
                      style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '0.5rem' }}
                    >
                      <option value="Oke-Ogere">Oke-Ogere</option>
                      <option value="Isale-Ogere">Isale-Ogere</option>
                      <option value="Ijana">Ijana</option>
                      <option value="Agbele">Agbele</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Respondent Info */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 900, marginBottom: '0.6rem' }}>
                  2. Respondent (Party B / Other Party)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.respondentName}
                      onChange={(e) => setFormData({ ...formData, respondentName: e.target.value })}
                      placeholder="Other Party's Name"
                      style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Phone Number (if known)</label>
                    <input
                      type="tel"
                      value={formData.respondentPhone}
                      onChange={(e) => setFormData({ ...formData, respondentPhone: e.target.value })}
                      placeholder="080..."
                      style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Family Compound / Address</label>
                    <input
                      type="text"
                      value={formData.respondentCompound}
                      onChange={(e) => setFormData({ ...formData, respondentCompound: e.target.value })}
                      placeholder="E.g. Agbole Jagunna"
                      style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Quarter</label>
                    <select
                      value={formData.respondentQuarter}
                      onChange={(e) => setFormData({ ...formData, respondentQuarter: e.target.value })}
                      style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '0.5rem' }}
                    >
                      <option value="Isale-Ogere">Isale-Ogere</option>
                      <option value="Oke-Ogere">Oke-Ogere</option>
                      <option value="Ijana">Ijana</option>
                      <option value="Agbele">Agbele</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>
                  Property / Incident Location in Ogere *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="E.g. Agbele Link Road near Pillar #14"
                  style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(201,150,58,0.3)', borderRadius: '4px', padding: '0.65rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>
                  Detailed Statement & Facts of Dispute *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Clearly explain the origins of the grievance, prior family attempts at resolution, survey markers, or agreements breached..."
                  style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(201,150,58,0.3)', borderRadius: '4px', padding: '0.65rem', lineHeight: 1.5 }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: 'linear-gradient(90deg, #C9963A 0%, #E6C687 100%)',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                {isSubmitting ? 'Transmitting Petition to Palace Registrar...' : '⚖️ Submit Petition to Palace Arbitrators'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: PALACE JUDICIAL BENCH */}
        {activeTab === 'bench' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {PALACE_ARBITRATORS.map((arb) => (
              <div
                key={arb.id}
                style={{
                  background: 'rgba(20, 10, 5, 0.8)',
                  border: '1px solid rgba(201, 150, 58, 0.3)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{arb.avatar}</div>
                <h3 style={{ color: 'var(--gold)', fontSize: '1.15rem', fontWeight: 900, margin: '0 0 0.2rem' }}>
                  {arb.name}
                </h3>
                <div style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  {arb.title}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.8rem' }}>
                  {arb.rank} · Quarter: {arb.quarter}
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                  <strong>Specialty Jurisdiction:</strong> {arb.specialty}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: CUSTOMARY LAW CHARTER */}
        {activeTab === 'charter' && (
          <div style={{ maxWidth: '850px', margin: '0 auto', background: 'rgba(20, 10, 5, 0.8)', border: '1px solid rgba(201,150,58,0.3)', borderRadius: '8px', padding: '2rem', lineHeight: 1.6 }}>
            <h2 style={{ color: 'var(--gold)', fontSize: '1.3rem', marginBottom: '1rem' }}>
              📜 Principles of Customary Arbitration in Ogere Remo
            </h2>
            <p>
              Under the ancestral sovereignty of the Ologere of Ogere Remo and the High Chiefs Council, customary arbitration serves as a revered alternative dispute resolution (ADR) system grounded in Yoruba customary jurisprudence (*Àwọn Ìlànà Àṣà àti Ìṣe*).
            </p>
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid var(--gold)' }}>
                <h4 style={{ color: '#ffffff', margin: '0 0 0.3rem' }}>1. Principle of Ancestral Reconciliation (*Ìwà Pẹ̀lẹ́*)</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>Customary arbitration seeks restoration of peace and communal brotherhood rather than punitive isolation.</p>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #38bdf8' }}>
                <h4 style={{ color: '#ffffff', margin: '0 0 0.3rem' }}>2. Binding Nature of Royal Consent Decrees</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>Resolutions consented to and executed before the Oliwo, Lisa, and Quarter Baales are deposited with the High Court Registry as legally enforceable consent judgements.</p>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #22c55e' }}>
                <h4 style={{ color: '#ffffff', margin: '0 0 0.3rem' }}>3. Digital Preservation in Kingdom Archives</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>All mediation decrees are sealed with tamper-proof digital seals and indexed in the Ogere Remo Kingdom Registry to protect future generations.</p>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* MODAL: OFFICIAL ROYAL MEDIATION DECREE */}
      {showDecreeModal && decreeCase && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }}>
          <div style={{ background: '#ffffff', color: '#000000', borderRadius: '8px', maxWidth: '650px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', border: '4px double #C9963A', position: 'relative' }}>
            {/* Seal Watermark Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #C9963A', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>👑</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#78350f', letterSpacing: '0.05em' }}>
                AAFIN OLOGERE PALACE COUNCIL OF ARBITRATION
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>
                OGERE REMO KINGDOM · OGUN STATE, NIGERIA
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#15803d', marginTop: '0.5rem' }}>
                OFFICIAL ROYAL MEDIATION CONSENT DECREE
              </div>
            </div>

            {/* Decree Body */}
            <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#1e293b' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#fef3c7', padding: '0.6rem', borderRadius: '4px', marginBottom: '1rem' }}>
                <div><strong>Decree Ref:</strong> {decreeCase.decreeSealNumber || 'AAFIN-DECREE-2026'}</div>
                <div><strong>Case Ref:</strong> {decreeCase.id}</div>
                <div><strong>Date of Sitting:</strong> {decreeCase.hearingDate}</div>
                <div><strong>Presiding:</strong> {decreeCase.assignedArbitrator?.name}</div>
              </div>

              <p>
                <strong>IN THE MATTER OF:</strong> {decreeCase.title}
              </p>
              <p>
                <strong>BETWEEN:</strong> {decreeCase.complainant.fullName} ({decreeCase.complainant.compound}, {decreeCase.complainant.quarter}) — <em>Complainant</em>
                <br />
                <strong>AND:</strong> {decreeCase.respondent.fullName} ({decreeCase.respondent.compound}, {decreeCase.respondent.quarter}) — <em>Respondent</em>
              </p>

              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '6px', margin: '1rem 0' }}>
                <div style={{ fontWeight: 900, color: '#0f172a', marginBottom: '0.3rem' }}>
                  TERMS OF MEDIATION & ROYAL DECLARATION:
                </div>
                <div style={{ fontStyle: 'italic' }}>
                  "{decreeCase.decreeSummary || 'Both parties having appeared before the Customary Judicial Bench, terms of peaceful settlement are hereby confirmed and sealed.'}"
                </div>
              </div>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem', borderTop: '1px dashed #94a3b8', paddingTop: '1rem' }}>
                <div>
                  <div style={{ height: '30px' }} />
                  <div style={{ borderTop: '1px solid #000', fontSize: '0.75rem', fontWeight: 800 }}>
                    {decreeCase.assignedArbitrator?.name}
                    <br />
                    <span style={{ fontWeight: 400, color: '#475569' }}>Chief Arbitrator for Ologere Council</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ height: '30px' }} />
                  <div style={{ borderTop: '1px solid #000', fontSize: '0.75rem', fontWeight: 800 }}>
                    HRH Ologere Royal Seal
                    <br />
                    <span style={{ fontWeight: 400, color: '#475569' }}>Palace Registrar Sign-off</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ flex: 1, background: '#15803d', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.7rem', fontWeight: 900, cursor: 'pointer' }}
              >
                🖨️ Print Official Decree PDF
              </button>
              <button
                type="button"
                onClick={() => setShowDecreeModal(false)}
                style={{ background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '4px', padding: '0.7rem 1.2rem', fontWeight: 800, cursor: 'pointer' }}
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
