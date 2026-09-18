// src/pages/DiasporaEscrowPage.jsx
// Diaspora Homeland Capital Projects & Milestone Escrow Grants Engine

import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import {
  ESCROW_PROJECTS,
  getEscrowProjects,
  getDonorsLedger,
  contributeToEscrowProject,
  releaseMilestoneEscrow,
} from '../services/diasporaEscrowService';

export default function DiasporaEscrowPage() {
  const [projects, setProjects] = useState(() => getEscrowProjects());
  const [donors, setDonors] = useState(() => getDonorsLedger());
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'contribute', 'ledger', 'governance'
  const [selectedProject, setSelectedProject] = useState(null);
  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [pledgeTarget, setPledgeTarget] = useState(null);

  // Contribution Form State
  const [pledgeForm, setPledgeForm] = useState({
    projectId: 'ESC-PRJ-01',
    donorName: '',
    donorLocation: 'London, United Kingdom',
    currency: 'GBP',
    amount: 100,
  });
  const [pledgeSuccess, setPledgeSuccess] = useState(null);

  useEffect(() => {
    const handleUpdate = () => {
      setProjects(getEscrowProjects());
      setDonors(getDonorsLedger());
    };
    window.addEventListener('ogere-escrow-updated', handleUpdate);
    return () => window.removeEventListener('ogere-escrow-updated', handleUpdate);
  }, []);

  const totalRaisedNgn = projects.reduce((acc, p) => acc + p.raisedNgn, 0);
  const totalTargetNgn = projects.reduce((acc, p) => acc + p.targetBudgetNgn, 0);
  const totalReleasedNgn = projects.reduce((acc, p) => acc + p.releasedNgn, 0);
  const totalLockedNgn = projects.reduce((acc, p) => acc + p.escrowLockedNgn, 0);

  const handlePledgeSubmit = (e) => {
    e.preventDefault();
    const rateMap = { USD: 1500, GBP: 1900, EUR: 1650, CAD: 1100, NGN: 1 };
    const rate = rateMap[pledgeForm.currency] || 1500;
    const amountNgn = Number(pledgeForm.amount) * rate;

    const res = contributeToEscrowProject(pledgeForm.projectId, {
      donorName: pledgeForm.donorName,
      donorLocation: pledgeForm.donorLocation,
      amountNgn: amountNgn,
      currencyString: `${pledgeForm.currency} (${pledgeForm.currency === 'USD' ? '$' : pledgeForm.currency === 'GBP' ? '£' : pledgeForm.currency === 'EUR' ? '€' : '₦'}${Number(pledgeForm.amount).toLocaleString()})`,
    });

    if (res.success) {
      setPledgeSuccess(res);
      setProjects(getEscrowProjects());
      setDonors(getDonorsLedger());
      setShowPledgeModal(false);
    }
  };

  return (
    <div>
      <SEO
        title="Diaspora Homeland Projects & Milestone Escrow Grants — Ogere Remo Kingdom"
        description="Transparent diaspora co-funding of landmark capital projects in Ogere Remo with milestone-based escrow fund releases."
      />

      <PageHero
        title="Diaspora Homeland Milestone Escrow"
        subtitle="Transparent Community Capital Projects Funded by Diaspora Sons & Daughters with Milestone Escrow Payouts"
        badge="🌍 DIASPORA ESCROW VAULT"
        badgeColor="#10b981"
      />

      <Section>
        {/* Metric Summary Ribbon */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34d399' }}>
              ₦{(totalRaisedNgn / 1000000).toFixed(1)}M
            </div>
            <div style={{ fontSize: '0.72rem', color: '#a7f3d0', fontWeight: 700 }}>TOTAL FUNDS MOBILIZED</div>
          </div>
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8' }}>
              ₦{(totalLockedNgn / 1000000).toFixed(1)}M
            </div>
            <div style={{ fontSize: '0.72rem', color: '#bae6fd', fontWeight: 700 }}>LOCKED IN ESCROW (UNRELEASED)</div>
          </div>
          <div style={{ background: 'rgba(201, 150, 58, 0.1)', border: '1px solid rgba(201, 150, 58, 0.3)', borderRadius: '8px', padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--gold)' }}>
              ₦{(totalReleasedNgn / 1000000).toFixed(1)}M
            </div>
            <div style={{ fontSize: '0.72rem', color: '#fde68a', fontWeight: 700 }}>VERIFIED MILESTONE PAYOUTS</div>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b' }}>
              {donors.length}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#fde68a', fontWeight: 700 }}>GLOBAL DIASPORA DONORS</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(16, 185, 129, 0.3)', paddingBottom: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { id: 'projects', label: '🏗️ Active Homeland Projects', icon: '🏛️' },
            { id: 'ledger', label: '📜 Global Donor Wall & Ledger', icon: '🌍' },
            { id: 'governance', label: '🛡️ Escrow Trust Architecture', icon: '🔒' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? '#10b981' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab.id ? '#000000' : '#f5edd8',
                border: activeTab === tab.id ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                padding: '0.6rem 1.2rem',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: ACTIVE HOMELAND PROJECTS */}
        {activeTab === 'projects' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {projects.map((project) => {
              const fundingPct = Math.min(100, Math.round((project.raisedNgn / project.targetBudgetNgn) * 100));

              return (
                <div
                  key={project.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '10px',
                    padding: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.7rem', background: '#047857', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                          {project.category}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{project.id}</span>
                      </div>
                      <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800, margin: '0.2rem 0' }}>
                        {project.title}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
                        📍 {project.location}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 900,
                          padding: '3px 10px',
                          borderRadius: '20px',
                          background: project.status === 'COMPLETED' ? 'rgba(34,197,94,0.2)' : 'rgba(16,185,129,0.2)',
                          color: '#34d399',
                          border: '1px solid #10b981',
                        }}
                      >
                        ● {project.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {project.description}
                  </p>

                  {/* Financial Progress Bar */}
                  <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '1rem', marginBottom: '1.2rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                      <span style={{ color: '#f8fafc', fontWeight: 800 }}>
                        Raised: <strong>₦{(project.raisedNgn / 1000000).toFixed(2)}M</strong> (~${Math.round(project.raisedNgn / 1500).toLocaleString()})
                      </span>
                      <span style={{ color: '#94a3b8' }}>
                        Target: ₦{(project.targetBudgetNgn / 1000000).toFixed(2)}M ({fundingPct}%)
                      </span>
                    </div>

                    <div style={{ height: '10px', background: '#334155', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                      <div
                        style={{
                          width: `${fundingPct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                          borderRadius: '5px',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                      <span>🔒 Locked in Escrow: ₦{(project.escrowLockedNgn / 1000000).toFixed(2)}M</span>
                      <span>✓ Released to Date: ₦{(project.releasedNgn / 1000000).toFixed(2)}M</span>
                      <span>👥 {project.donorsCount} Donors</span>
                    </div>
                  </div>

                  {/* Milestone Inspection Stages */}
                  <div style={{ marginBottom: '1.2rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '0.5rem' }}>
                      🎯 VERIFIED MILESTONE ESCROW STAGES:
                    </div>
                    <div style={{ display: 'grid', gap: '0.6rem' }}>
                      {project.milestones.map((m, mIdx) => {
                        const isReleased = m.status === 'RELEASED';
                        const isPending = m.status === 'VERIFICATION_PENDING';

                        return (
                          <div
                            key={m.id}
                            style={{
                              background: isReleased ? 'rgba(34,197,94,0.08)' : isPending ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.02)',
                              border: isReleased ? '1px solid #22c55e' : isPending ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '6px',
                              padding: '0.6rem 0.8rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '0.5rem',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>
                                {m.title} ({m.percentage}% · ₦{(m.amountNgn / 1000000).toFixed(2)}M)
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                Proof: {m.evidence}
                              </div>
                            </div>

                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 900,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: isReleased ? '#15803d' : isPending ? '#0284c7' : '#334155',
                                color: '#ffffff',
                              }}
                            >
                              {isReleased ? '✓ ESCROW RELEASED' : isPending ? '⏳ PENDING AUDIT' : '🔒 LOCKED'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lead Supervisors & Action Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      <div><strong>Lead Supervisor:</strong> {project.leadSupervisor}</div>
                      <div><strong>Royal Signatory:</strong> {project.palaceSignatory}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPledgeTarget(project);
                        setPledgeForm((prev) => ({ ...prev, projectId: project.id }));
                        setShowPledgeModal(true);
                      }}
                      style={{
                        background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.6rem 1.2rem',
                        fontSize: '0.85rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)',
                      }}
                    >
                      <span>🤝</span> Pledge / Contribute to Project
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: GLOBAL DONOR WALL & LEDGER */}
        {activeTab === 'ledger' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#34d399', margin: '0 0 0.3rem' }}>
                🌍 Diaspora Homeland Honor Roll & Transparent Ledger
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Every single dollar, pound, euro, and naira donated is publicly audited and locked into milestone escrow contracts.
              </p>
            </div>

            <div style={{ display: 'grid', gap: '0.8rem' }}>
              {donors.map((donor) => (
                <div
                  key={donor.id}
                  style={{
                    background: 'rgba(20, 10, 5, 0.75)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '8px',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ fontSize: '1.8rem' }}>🏅</div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                        {donor.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                        📍 {donor.location} · {donor.date}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                        Funded: <em>{donor.projectTitle}</em>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#34d399' }}>
                      {donor.currency}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#86efac' }}>
                      ₦{donor.amountNgn.toLocaleString()} Escrow Credited
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ESCROW TRUST ARCHITECTURE */}
        {activeTab === 'governance' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '2rem', lineHeight: 1.6 }}>
            <h2 style={{ color: '#34d399', fontSize: '1.3rem', marginBottom: '1rem' }}>
              🔒 The Ogere 3-Key Milestone Escrow Model
            </h2>
            <p style={{ color: '#cbd5e1' }}>
              To solve the historical problem of abandoned constituency projects and lack of accountability, all diaspora funds donated via this portal are locked into a programmatic escrow vault.
            </p>

            <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #34d399' }}>
                <h4 style={{ color: '#fff', margin: '0 0 0.3rem' }}>1. Zero Lump-Sum Payouts</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Contractors receive only 30% mobilization. The next tranche is only unlocked after verified photo and structural inspection.</p>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #38bdf8' }}>
                <h4 style={{ color: '#fff', margin: '0 0 0.3rem' }}>2. Multi-Party Independent Sign-off</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Milestones require concurrent sign-off from: (a) OCDA Chief Engineer, (b) Royal Palace Works Liaison, and (c) Diaspora Project Auditor.</p>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid var(--gold)' }}>
                <h4 style={{ color: '#fff', margin: '0 0 0.3rem' }}>3. Public Transparency Ledger</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>All bank transfers and Paystack receipts are published directly to the public ledger for community verification.</p>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* PLEDGE CONTRIBUTION MODAL */}
      {showPledgeModal && pledgeTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }}>
          <div style={{ background: '#120804', border: '2px solid #10b981', borderRadius: '10px', maxWidth: '500px', width: '100%', padding: '1.75rem', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#34d399' }}>
                🤝 Contribute to Escrow Project
              </div>
              <button
                type="button"
                onClick={() => setShowPledgeModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>
              Project: <strong>{pledgeTarget.title}</strong>
            </div>

            <form onSubmit={handlePledgeSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 800 }}>Your Name *</label>
                <input
                  type="text"
                  required
                  value={pledgeForm.donorName}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, donorName: e.target.value })}
                  placeholder="E.g. Dr. Kemi Adeleke"
                  style={{ width: '100%', background: '#1c100b', color: '#fff', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '4px', padding: '0.5rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 800 }}>Diaspora Location (City & Country) *</label>
                <input
                  type="text"
                  required
                  value={pledgeForm.donorLocation}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, donorLocation: e.target.value })}
                  placeholder="E.g. London, UK or Atlanta, USA"
                  style={{ width: '100%', background: '#1c100b', color: '#fff', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '4px', padding: '0.5rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 800 }}>Currency</label>
                  <select
                    value={pledgeForm.currency}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, currency: e.target.value })}
                    style={{ width: '100%', background: '#1c100b', color: '#fff', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '4px', padding: '0.5rem' }}
                  >
                    <option value="GBP">GBP (£)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="NGN">NGN (₦)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 800 }}>Pledge Amount *</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={pledgeForm.amount}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, amount: e.target.value })}
                    style={{ width: '100%', background: '#1c100b', color: '#fff', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '4px', padding: '0.5rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                }}
              >
                🔒 Confirm Escrow Contribution
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
