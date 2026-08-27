import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';
import { dbGetAll } from '../services/db';

export default function VerifyIdPage() {
  const { code: routeCode } = useParams();
  const [searchParams] = useSearchParams();
  const queryCode = searchParams.get('code');
  const initialCode = routeCode || queryCode || '';

  const [inputCode, setInputCode] = useState(initialCode);
  const [record, setRecord] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const verifyCode = async (codeToVerify) => {
    if (!codeToVerify || !codeToVerify.trim()) return;
    setLoading(true);
    setSearched(true);

    const cards = await dbGetAll('id_cards');
    const cleanCode = codeToVerify.trim().toUpperCase();
    const match = cards.find(
      c => c.id?.toUpperCase() === cleanCode || c.idNumber?.toUpperCase() === cleanCode
    );

    setRecord(match || null);
    setLoading(false);
  };

  useEffect(() => {
    if (initialCode) {
      verifyCode(initialCode);
    }
  }, [initialCode]);

  const handleSearch = (e) => {
    e.preventDefault();
    verifyCode(inputCode);
  };

  return (
    <div>
      <SEO
        title="Verify Digital ID"
        description="Official public verification portal for Ogere Remo Digital Community Identity Cards."
      />
      <Hero
        ey="Public Registry"
        ti="Digital ID Verification"
        sub="Verify the authenticity and status of any official Ogere Community Identity Card."
        dark
      />

      <div style={{ background: 'linear-gradient(135deg, #7A2E0E, #B5451B)', padding: '0.65rem 2rem', textAlign: 'center' }}>
        <span className="cinzel" style={{ fontSize: '0.62rem', letterSpacing: '0.18em', color: 'white', textTransform: 'uppercase' }}>
          👑 OFFICIAL PALACE VERIFICATION DATABASE · SECURE & TRANSPARENT
        </span>
      </div>

      <Section bg="#0d0704" py="4rem">
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <input
                className="inp"
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                placeholder="Enter ID Number (e.g. OGR-782910)..."
                style={{ flex: 1, minWidth: 'min(240px, 100%)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              />
              <button type="submit" className="btn-p" disabled={loading} style={{ minWidth: '140px' }}>
                {loading ? 'Verifying…' : '🔍 Verify ID'}
              </button>
            </div>
          </form>

          {/* Result Section */}
          {searched && !loading && record && (
            <div
              className="glass"
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: record.status === 'approved' ? '2px solid var(--gold)' : '2px solid #ef4444',
                animation: 'fadeUp 0.4s ease both',
              }}
            >
              <div
                style={{
                  background: record.status === 'approved' ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)',
                  borderBottom: `1px solid ${record.status === 'approved' ? '#22c55e' : '#ef4444'}`,
                  padding: '1.2rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>
                  {record.status === 'approved' ? '✅' : '⚠️'}
                </div>
                <div
                  className="cinzel"
                  style={{
                    fontSize: '1rem',
                    fontWeight: 900,
                    color: record.status === 'approved' ? '#86efac' : '#fca5a5',
                    letterSpacing: '0.1em',
                  }}
                >
                  {record.status === 'approved' ? 'AUTHENTIC & VERIFIED' : 'PENDING OR UNVERIFIED'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(245,237,216,0.6)', marginTop: '0.2rem' }}>
                  Official Record ID: <strong style={{ color: 'var(--cream)' }}>{record.id || record.idNumber}</strong>
                </div>
              </div>

              <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <div className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Full Name</div>
                    <div className="playfair" style={{ fontSize: '1.25rem', color: 'var(--cream)', marginTop: '0.2rem' }}>{record.fullName || record.name}</div>
                  </div>
                  <div>
                    <div className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Card Classification</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--gold-light)', textTransform: 'capitalize', fontWeight: 'bold', marginTop: '0.2rem' }}>
                      {record.cardType || 'Indigene'} Status
                    </div>
                  </div>
                  <div>
                    <div className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Quarter / Sector</div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(245,237,216,0.85)', marginTop: '0.2rem' }}>{record.quarter || 'Oke-Ogere'}</div>
                  </div>
                  <div>
                    <div className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Ancestral Compound</div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(245,237,216,0.85)', marginTop: '0.2rem' }}>{record.compound || '—'}</div>
                  </div>
                  <div>
                    <div className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Date Issued</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.7)', marginTop: '0.2rem' }}>{record.issuedDate || '2024-01-15'}</div>
                  </div>
                  <div>
                    <div className="cinzel" style={{ fontSize: '0.55rem', color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Valid Through</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.7)', marginTop: '0.2rem' }}>{record.expiryDate || '2027-01-15'}</div>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(201,150,58,0.06)',
                    border: '1px solid rgba(201,150,58,0.2)',
                    borderRadius: '8px',
                    padding: '1rem',
                    borderLeft: '4px solid var(--gold)',
                    fontSize: '0.78rem',
                    color: 'rgba(245,237,216,0.65)',
                    lineHeight: 1.7,
                  }}
                >
                  👑 <strong>Authorised Authority:</strong> {record.verifiedBy || 'HRH Ologere Palace Office · Ogere Community Development Association (OCDA)'}. This digital record verifies that the holder has registered with the official kingdom registry.
                </div>
              </div>
            </div>
          )}

          {searched && !loading && !record && (
            <div
              className="glass"
              style={{
                borderRadius: '12px',
                padding: '3rem 2rem',
                textAlign: 'center',
                border: '1px solid rgba(220,38,38,0.4)',
                animation: 'fadeUp 0.4s ease both',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
              <h3 className="playfair" style={{ fontSize: '1.6rem', color: '#fca5a5', marginBottom: '0.6rem' }}>
                No Matching ID Record Found
              </h3>
              <p style={{ color: 'rgba(245,237,216,0.6)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                The ID code <strong>"{inputCode}"</strong> could not be verified in the Ogere Community Database. Please check for typing mistakes or apply for an official digital ID.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/id-card" className="btn-p" style={{ textDecoration: 'none' }}>
                  Apply for Digital ID →
                </Link>
                <Link to="/contact" className="btn-o" style={{ textDecoration: 'none' }}>
                  Contact Palace Secretariat
                </Link>
              </div>
            </div>
          )}
        </div>
      </Section>
      <AdireDivider />
    </div>
  );
}
