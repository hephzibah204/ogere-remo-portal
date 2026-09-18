// src/pages/FixMyStreetPage.jsx
// Fix My Street — Civic Infrastructure & Public Works Issue Tracker for Ogere Remo

import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import {
  ISSUE_CATEGORIES,
  OGERE_QUARTERS,
  getStreetIssues,
  reportStreetIssue,
  upvoteStreetIssue,
  getPowerGridStatus,
  toggleQuarterPower,
} from '../services/fixMyStreetService';
import { resolveOgereLocation, getOgereMapUrls } from '../services/ogereGeoEngine';

export default function FixMyStreetPage() {
  const [issues, setIssues] = useState(() => getStreetIssues());
  const [powerGrid, setPowerGrid] = useState(() => getPowerGridStatus());
  const [activeTab, setActiveTab] = useState('issues'); // 'issues', 'report', 'power', 'leaderboard'
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterQuarter, setFilterQuarter] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Report Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'pothole_road',
    quarter: 'Oke-Ogere',
    location: '',
    latitude: 6.9368,
    longitude: 3.6330,
    severity: 'HIGH',
    reporterName: '',
    description: '',
  });
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  useEffect(() => {
    const handleIssueUpdate = () => setIssues(getStreetIssues());
    const handlePowerUpdate = () => setPowerGrid(getPowerGridStatus());

    window.addEventListener('ogere-fms-updated', handleIssueUpdate);
    window.addEventListener('ogere-power-grid-updated', handlePowerUpdate);

    return () => {
      window.removeEventListener('ogere-fms-updated', handleIssueUpdate);
      window.removeEventListener('ogere-power-grid-updated', handlePowerUpdate);
    };
  }, []);

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const loc = resolveOgereLocation(lat, lng, pos.coords.accuracy);
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          location: loc.formattedText,
          quarter: loc.sector.includes('Sector 2') ? 'Oke-Ogere' : loc.sector.includes('Sector 4') ? 'Isale-Ogere' : 'Oke-Ogere',
        }));
        setIsDetectingGps(false);
      },
      () => {
        setIsDetectingGps(false);
        alert('Could not detect GPS location. Please type landmark manually.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const created = reportStreetIssue(formData);
    setSubmitSuccess(created);
    setFormData({
      title: '',
      category: 'pothole_road',
      quarter: 'Oke-Ogere',
      location: '',
      latitude: 6.9368,
      longitude: 3.6330,
      severity: 'HIGH',
      reporterName: '',
      description: '',
    });
    setIssues(getStreetIssues());
  };

  const handleUpvote = (id) => {
    upvoteStreetIssue(id);
    setIssues(getStreetIssues());
  };

  const filteredIssues = issues.filter((i) => {
    const matchCat = filterCategory === 'all' || i.category === filterCategory;
    const matchQtr = filterQuarter === 'all' || i.quarter.toLowerCase().includes(filterQuarter.toLowerCase());
    const matchStat = filterStatus === 'all' || i.status === filterStatus;
    const matchQuery =
      searchQuery.trim() === '' ||
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQtr && matchStat && matchQuery;
  });

  const sortedLeaderboard = [...issues].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div>
      <SEO
        title="Fix My Street & Power Grid Tracker — Ogere Remo Kingdom"
        description="Crowdsourced civic public works issue tracker, road repairs, and live IBEDC power grid uptime monitor for Ogere Remo."
      />

      <PageHero
        title="Fix My Street & Public Works Tracker"
        subtitle="Crowdsourced Civic Reporting, Road Pothole Triage & Live Quarter Power Grid Monitor for Ogere Remo"
        badge="🚧 CIVIC INFRASTRUCTURE"
        badgeColor="#f59e0b"
      />

      <Section>
        {/* Power Grid Live Ribbon */}
        <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid #334155', borderRadius: '10px', padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem' }}>⚡</span>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fde047' }}>
                  OGERE REMO ELECTRICITY GRID (IBEDC) LIVE MONITOR
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  Live crowd-verified transformer status across all 5 quarters of Ogere Remo
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.65rem', background: '#16a34a', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
              🟢 GRID ACTIVE
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem' }}>
            {powerGrid.map((qtr) => {
              const isOn = qtr.powerStatus === 'ON';
              return (
                <div
                  key={qtr.id}
                  style={{
                    background: isOn ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.15)',
                    border: isOn ? '1px solid #22c55e' : '1px solid #ef4444',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc' }}>{qtr.name}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: isOn ? '#4ade80' : '#f87171' }}>
                        ● {qtr.powerStatus}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>{qtr.transformer}</div>
                    <div style={{ fontSize: '0.58rem', color: '#94a3b8', marginTop: '2px' }}>
                      Load: {qtr.loadRating} · Changed {qtr.lastPowerChange}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleQuarterPower(qtr.id)}
                    style={{
                      marginTop: '0.5rem',
                      background: isOn ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 197, 94, 0.25)',
                      border: isOn ? '1px solid #ef4444' : '1px solid #22c55e',
                      color: isOn ? '#fca5a5' : '#86efac',
                      borderRadius: '4px',
                      padding: '3px',
                      fontSize: '0.58rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {isOn ? '⚡ Report Outage' : '✓ Report Power Restored'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(245, 158, 11, 0.3)', paddingBottom: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { id: 'issues', label: '🚧 Public Works Issue Feed', icon: '📋' },
            { id: 'report', label: '📸 Report a Civic Issue', icon: '✍️' },
            { id: 'leaderboard', label: '🔥 Top Community Priorities', icon: '🏆' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setSubmitSuccess(null);
              }}
              style={{
                background: activeTab === tab.id ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab.id ? '#000000' : '#f5edd8',
                border: activeTab === tab.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
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

        {/* TAB 1: ALL REPORTED ISSUES */}
        {activeTab === 'issues' && (
          <div>
            {/* Filter Controls */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by street name, issue description or ID..."
                style={{
                  flex: 1,
                  minWidth: '220px',
                  background: '#120804',
                  color: '#fff',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: '6px',
                  padding: '0.6rem 1rem',
                  fontSize: '0.85rem',
                }}
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ background: '#120804', color: '#f5edd8', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="all">All Issue Categories</option>
                {ISSUE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ background: '#120804', color: '#f5edd8', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px', padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="all">All Statuses</option>
                <option value="REPORTED">Reported</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="CONTRACTOR_ASSIGNED">Contractor Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            {/* Issues List */}
            <div style={{ display: 'grid', gap: '1.2rem' }}>
              {filteredIssues.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
                  <div style={{ fontSize: '1.1rem', color: '#f59e0b', fontWeight: 800 }}>No Reported Issues in this Filter</div>
                </div>
              ) : (
                filteredIssues.map((issue) => {
                  const categoryMeta = ISSUE_CATEGORIES.find((c) => c.id === issue.category) || ISSUE_CATEGORIES[0];
                  const mapUrls = getOgereMapUrls(issue.latitude, issue.longitude, issue.title);
                  const isResolved = issue.status === 'RESOLVED';
                  const inProgress = issue.status === 'IN_PROGRESS' || issue.status === 'CONTRACTOR_ASSIGNED';

                  return (
                    <div
                      key={issue.id}
                      style={{
                        background: 'rgba(20, 10, 5, 0.75)',
                        border: isResolved ? '1px solid #22c55e' : inProgress ? '1px solid #38bdf8' : '1px solid rgba(245, 158, 11, 0.3)',
                        borderLeft: `6px solid ${categoryMeta.color}`,
                        borderRadius: '8px',
                        padding: '1.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <span style={{ fontSize: '0.7rem', background: 'rgba(245,158,11,0.2)', color: '#fde047', border: '1px solid rgba(245,158,11,0.4)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                              {issue.id}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                              Reported by {issue.reporterName} · {new Date(issue.reportedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 800, margin: 0 }}>
                            {categoryMeta.icon} {issue.title}
                          </h3>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 900,
                              padding: '3px 9px',
                              borderRadius: '20px',
                              background: isResolved ? 'rgba(34, 197, 94, 0.2)' : inProgress ? 'rgba(56, 189, 248, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                              color: isResolved ? '#4ade80' : inProgress ? '#38bdf8' : '#fde047',
                              border: `1px solid ${isResolved ? '#22c55e' : inProgress ? '#38bdf8' : '#f59e0b'}`,
                            }}
                          >
                            ● {issue.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--gold-light)', marginBottom: '0.6rem', fontWeight: 700 }}>
                        📍 {issue.location} ({issue.quarter})
                      </div>

                      <p style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                        {issue.description}
                      </p>

                      {/* Contractor & Triage Progress */}
                      {issue.assignedContractor && (
                        <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.6rem 0.8rem', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                          <div style={{ color: '#38bdf8', fontWeight: 800 }}>
                            🛠️ Assigned Unit: {issue.assignedContractor}
                          </div>
                          <div style={{ color: '#cbd5e1', marginTop: '2px' }}>
                            Status Note: {issue.contractorEta}
                          </div>
                        </div>
                      )}

                      {/* Actions Bar: Upvote & Maps */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                        <button
                          type="button"
                          onClick={() => handleUpvote(issue.id)}
                          style={{
                            background: 'rgba(245, 158, 11, 0.15)',
                            border: '1px solid #f59e0b',
                            color: '#fde047',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 900,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <span>👍 Endorse / Me Too</span>
                          <span style={{ background: '#f59e0b', color: '#000', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>
                            {issue.upvotes}
                          </span>
                        </button>

                        <a
                          href={mapUrls.googleMapsUrl}
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
                          🗺️ View Exact GPS Location ↗
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: REPORT A CIVIC ISSUE FORM */}
        {activeTab === 'report' && (
          <div style={{ maxWidth: '750px', margin: '0 auto', background: 'rgba(20, 10, 5, 0.85)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '10px', padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2rem' }}>📸</div>
              <h2 style={{ fontSize: '1.4rem', color: '#f59e0b', margin: '0.4rem 0' }}>
                Report a Civic Infrastructure Issue
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Your report is dispatched directly to the OCDA Works Department & Remo North Public Utilities Triage Desk.
              </p>
            </div>

            {submitSuccess && (
              <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', color: '#4ade80', fontWeight: 900 }}>
                  ✓ Issue Reported Successfully! Ticket #{submitSuccess.id}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#f8fafc', marginTop: '0.3rem' }}>
                  Public works engineers have been notified. Citizens can now upvote your ticket.
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#fde047', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>
                  Issue Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E.g. Broken transformer cable sparking on Hospital Road"
                  style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '4px', padding: '0.65rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#fde047', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '4px', padding: '0.65rem' }}
                  >
                    {ISSUE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#fde047', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>
                    Town Quarter *
                  </label>
                  <select
                    value={formData.quarter}
                    onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                    style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '4px', padding: '0.65rem' }}
                  >
                    <option value="Oke-Ogere">Oke-Ogere Quarter</option>
                    <option value="Isale-Ogere">Isale-Ogere Quarter</option>
                    <option value="Ijana">Ijana Quarter</option>
                    <option value="Agbele">Agbele Ancestral Corridor</option>
                    <option value="Expressway">Expressway / Tollgate Corridor</option>
                  </select>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#fde047', fontWeight: 800 }}>
                    Exact Landmark & Street Location *
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={isDetectingGps}
                    style={{
                      background: 'rgba(56,189,248,0.2)',
                      border: '1px solid #38bdf8',
                      color: '#38bdf8',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {isDetectingGps ? '🛰️ Detecting...' : '🎯 Auto-Detect GPS Location'}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="E.g. Palace Way opposite Oja Oba main entrance"
                  style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '4px', padding: '0.65rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#fde047', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>
                    Severity Rating *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '4px', padding: '0.65rem' }}
                  >
                    <option value="LOW">Low (Minor inconvenience)</option>
                    <option value="MEDIUM">Medium (Moderate traffic or drainage blockage)</option>
                    <option value="HIGH">High (Major road damage / flood risk)</option>
                    <option value="CRITICAL">Critical (Life hazard / electrical surge)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#fde047', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.reporterName}
                    onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                    placeholder="Anonymous or Name"
                    style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '4px', padding: '0.65rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#fde047', fontWeight: 800, display: 'block', marginBottom: '0.3rem' }}>
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide specific details to help the repair crew bring the right equipment and materials..."
                  style={{ width: '100%', background: '#120804', color: '#fff', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '4px', padding: '0.65rem', lineHeight: 1.5 }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
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
                🚀 Submit Report to OCDA Works
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: TOP COMMUNITY PRIORITIES LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#f59e0b', margin: '0 0 0.3rem' }}>
                🔥 Most Upvoted Public Works Issues
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Issues prioritized automatically by citizen endorsements for immediate municipal budgeting.
              </p>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {sortedLeaderboard.map((item, rank) => (
                <div
                  key={item.id}
                  style={{
                    background: 'rgba(20, 10, 5, 0.7)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: rank === 0 ? '#f59e0b' : rank === 1 ? '#94a3b8' : '#78350f',
                        color: rank === 0 ? '#000' : '#fff',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                      }}
                    >
                      #{rank + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        📍 {item.location} ({item.quarter}) · Status: {item.status.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fde047' }}>
                        {item.upvotes}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>ENDORSEMENTS</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpvote(item.id)}
                      style={{
                        background: '#f59e0b',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      +1 Upvote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
