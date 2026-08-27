import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';
import { dbGetAll, dbInsert } from '../services/db';

export default function LandRegistryPage() {
  const [registry, setRegistry] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ownerName: '', contact: '', area: '', size: '', use: 'Residential', coord: '', documents: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loadData = async () => {
    const data = await dbGetAll('land_registry');
    setRegistry(data || []);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = (e) => setRegistry(e.detail || []);
    window.addEventListener('db-land_registry-updated', handleUpdate);
    return () => window.removeEventListener('db-land_registry-updated', handleUpdate);
  }, []);

  const filteredRegistry = registry.filter(r => 
    (r.id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.area || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.owner || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newPlot = {
      id: `OGR-LND-${Math.floor(100 + Math.random() * 900)}`,
      area: form.area,
      owner: form.ownerName,
      size: form.size,
      use: form.use,
      status: 'Pending Survey',
      date: new Date().toISOString().split('T')[0],
      coord: form.coord || '6.9800° N, 3.6500° E',
      disputes: 0,
      documents: form.documents || 'Application filed online',
      contact: form.contact,
    };
    await dbInsert('land_registry', newPlot);
    setSubmitted(true);
    setLoading(false);
    setForm({ ownerName: '', contact: '', area: '', size: '', use: 'Residential', coord: '', documents: '' });
    setTimeout(() => { setShowForm(false); setSubmitted(false); }, 3500);
  };

  return (
    <div>
      <SEO title="Digital Land Registry" description="Ogere Remo official digital land registry. Verify land ownership, register plots, and resolve boundaries to prevent disputes." />
      <Hero ey="Land & Property" ti="Digital Land Registry" sub="A transparent, community-backed record of land ownership in Ogereland to prevent encroachment and secure heritage." dark />

      <div style={{ background: '#0d0704', padding: '1rem 2rem', textAlign: 'center', borderBottom: '1px solid rgba(201,150,58,0.2)' }}>
         <span className="cinzel" style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(245,237,216,0.7)', textTransform: 'uppercase' }}>
            📜 SECURING THE LAND OF OUR FATHERS FOR FUTURE GENERATIONS
         </span>
      </div>

      <Section bg="#1a0d06" py="4rem">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="playfair" style={{ fontSize: '2rem', color: 'var(--cream)' }}>Public Registry</h2>
              <p style={{ color: 'rgba(245,237,216,0.5)', fontSize: '0.9rem' }}>Showing {filteredRegistry.length} recorded community plots</p>
            </div>
            <div style={{ minWidth: 'min(250px, 100%)', flex: 1, maxWidth: '400px' }}>
              <input 
                className="inp" 
                placeholder="Search by Land ID, Owner, or Area..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ borderRadius: '30px', padding: '0.8rem 1.5rem', background: 'rgba(201,150,58,0.05)' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto', background: 'rgba(13,7,4,0.6)', border: '1px solid rgba(201,150,58,0.2)', borderRadius: '12px' }}>
            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr className="cinzel" style={{ background: 'rgba(201,150,58,0.1)', color: 'var(--gold)', fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                  <th style={{ padding: '1rem', borderBottom: '1px solid rgba(201,150,58,0.2)' }}>Land ID</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid rgba(201,150,58,0.2)' }}>Owner / Compound</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid rgba(201,150,58,0.2)' }}>Area</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid rgba(201,150,58,0.2)' }}>Size & Use</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid rgba(201,150,58,0.2)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistry.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(201,150,58,0.05)', fontSize: '0.85rem' }}>
                    <td style={{ padding: '1rem', color: 'var(--cream)', fontWeight: 'bold' }}>{r.id}</td>
                    <td style={{ padding: '1rem', color: 'rgba(245,237,216,0.8)' }}>{r.owner}</td>
                    <td style={{ padding: '1rem', color: 'rgba(245,237,216,0.6)' }}>📍 {r.area}</td>
                    <td style={{ padding: '1rem', color: 'rgba(245,237,216,0.6)' }}>{r.size} <br/><span style={{ fontSize: '0.7rem', color: 'rgba(245,237,216,0.4)' }}>{r.use}</span></td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                        background: r.status === 'Verified' ? 'rgba(22,163,74,0.1)' : r.status === 'Disputed' ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.1)',
                        color: r.status === 'Verified' ? '#86efac' : r.status === 'Disputed' ? '#fca5a5' : '#fcd34d',
                        border: `1px solid ${r.status === 'Verified' ? 'rgba(22,163,74,0.3)' : r.status === 'Disputed' ? 'rgba(220,38,38,0.3)' : 'rgba(217,119,6,0.3)'}`
                      }}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredRegistry.length === 0 && (
                   <tr>
                     <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'rgba(245,237,216,0.4)' }}>No records found matching your search.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <p style={{ fontSize: '0.75rem', color: 'rgba(245,237,216,0.4)', marginTop: '1rem', textAlign: 'center' }}>
            Note: This registry is a community transparency tool managed by OCDA and does not supersede State or Federal Government Certificates of Occupancy (C of O).
          </p>
        </div>
      </Section>

      <AdireDivider />

      <Section bg="var(--dark)" py="5rem">
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          
          {!showForm && !submitted && (
            <div className="glass" style={{ textAlign: 'center', padding: 'clamp(1.5rem, 4vw, 3rem)', borderRadius: '12px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 className="playfair" style={{ fontSize: '2rem', color: 'var(--cream)', marginBottom: '1rem' }}>Register Your Land</h3>
              <p style={{ color: 'rgba(245,237,216,0.6)', marginBottom: '2rem', lineHeight: 1.6 }}>
                Secure your family land or acquired property by registering it on the community database. Registration helps prevent encroachment, alerts the community to ownership, and assists in boundary dispute resolution.
              </p>
              <button className="btn-p" onClick={() => setShowForm(true)}>Begin Registration →</button>
            </div>
          )}

          {showForm && !submitted && (
             <form onSubmit={handleSubmit} style={{ animation: 'fadeUp 0.4s ease both' }}>
                <div className="glass" style={{ padding: 'clamp(1.2rem, 4vw, 2.5rem)', borderRadius: '12px', borderTop: '3px solid var(--gold)' }}>
                  <h3 className="playfair" style={{ fontSize: '1.8rem', color: 'var(--cream)', marginBottom: '2rem', textAlign: 'center' }}>Land Registration Form</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '1.2rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="cinzel" style={{ display: 'block', fontSize: '0.52rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Owner Name / Compound *</label>
                      <input required className="inp" value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="E.g. Adebowale Family or John Doe" />
                    </div>
                    <div>
                      <label className="cinzel" style={{ display: 'block', fontSize: '0.52rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>General Area *</label>
                      <input required className="inp" value={form.area} onChange={e => set('area', e.target.value)} placeholder="E.g. Oke-Ogere, Ajura Border" />
                    </div>
                    <div>
                      <label className="cinzel" style={{ display: 'block', fontSize: '0.52rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Approx Size *</label>
                      <input required className="inp" value={form.size} onChange={e => set('size', e.target.value)} placeholder="E.g. 2 Plots, 10 Acres" />
                    </div>
                    <div>
                       <label className="cinzel" style={{ display: 'block', fontSize: '0.52rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Primary Use</label>
                       <select className="inp" value={form.use} onChange={e => set('use', e.target.value)} style={{ background: 'rgba(201,150,58,0.05)' }}>
                         {['Residential', 'Commercial', 'Agricultural', 'Educational', 'Religious', 'Mixed Use'].map(u => <option key={u} value={u}>{u}</option>)}
                       </select>
                    </div>
                    <div>
                      <label className="cinzel" style={{ display: 'block', fontSize: '0.52rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>GPS Coordinates (Optional)</label>
                      <input className="inp" value={form.coord} onChange={e => set('coord', e.target.value)} placeholder="e.g. 6.9371, 3.6335" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="cinzel" style={{ display: 'block', fontSize: '0.52rem', color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Owner Contact Phone/Email *</label>
                      <input required className="inp" value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="So OCDA can verify this application" />
                    </div>
                  </div>
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(201,150,58,0.05)', borderRadius: '6px', border: '1px solid rgba(201,150,58,0.2)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(245,237,216,0.6)', margin: 0 }}>
                      ℹ️ After submission, you will be required to present physical copies of your survey plan or family receipt to the OCDA Land Committee for verification before your listing becomes public.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                  <button type="button" className="btn-o" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn-p">Submit for Verification →</button>
                </div>
             </form>
          )}

          {submitted && (
             <div style={{ textAlign: 'center', padding: '3rem', animation: 'fadeUp 0.4s ease both' }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
               <div className="playfair" style={{ fontSize: '1.5rem', color: 'var(--cream)' }}>Registration Submitted</div>
               <p style={{ color: 'rgba(245,237,216,0.6)', marginTop: '0.5rem' }}>The Land Committee will contact you shortly to verify your documents.</p>
             </div>
          )}

        </div>
      </Section>
      <AdireDivider />
    </div>
  );
}
