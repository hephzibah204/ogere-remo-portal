import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';

const PROJECTS = [
  { name: 'Ogere Modern Market Renovation', status: 'In Progress', progress: 65, budget: 'Community Funded', desc: 'Roofing and structural upgrade of the central market stalls.' },
  { name: 'Palace Solar Power Installation', status: 'Completed', progress: 100, budget: 'Diaspora Grant', desc: 'Installation of 15kVA solar panels to ensure 24/7 power at the Ologere palace.' },
  { name: 'Ajura Border Road Grading', status: 'Pending', progress: 10, budget: 'OCDA / Govt Partnership', desc: 'Grading of the 3km farm road linking Ogere to the Ajura border.' },
  { name: 'Community Library Tech Hub', status: 'In Progress', progress: 40, budget: 'Corporate CSR', desc: 'Equipping the town library with 20 computers and broadband internet.' },
];

export default function GovernancePage() {
  return (
    <div>
      <SEO title="Governance Dashboard" description="Transparency portal for Ogere Remo development projects, community funds, and palace administration." />
      <Hero ey="Transparency & Development" ti="Governance Dashboard" sub="Tracking community projects, initiatives, and town administration under the reign of HRH Oba James Obafemi Saliu." dark />

      <Section bg="#0d0704" py="4rem">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="playfair" style={{ fontSize: '2.5rem', color: 'var(--cream)' }}>Development Projects Tracker</h2>
          <p style={{ color: 'rgba(245,237,216,0.6)' }}>Monitoring ongoing infrastructure and community initiatives.</p>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
          {PROJECTS.map(p => (
            <div key={p.name} className="glass" style={{ padding: '1.5rem', borderRadius: '8px', borderLeft: `4px solid ${p.progress === 100 ? '#16a34a' : p.progress > 20 ? '#d97706' : '#dc2626'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 className="playfair" style={{ fontSize: '1.2rem', color: 'var(--cream)' }}>{p.name}</h3>
                <span style={{ fontSize: '0.65rem', background: 'rgba(201,150,58,0.1)', color: 'var(--gold)', padding: '3px 8px', borderRadius: '4px' }}>{p.status}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.7)', marginBottom: '1rem' }}>{p.desc}</p>
              
              <div style={{ background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div style={{ background: p.progress === 100 ? '#16a34a' : 'var(--gold)', width: `${p.progress}%`, height: '100%', transition: 'width 1s ease' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(245,237,216,0.4)' }}>
                <span>{p.progress}% Completed</span>
                <span>Funding: {p.budget}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <AdireDivider />

      <Section bg="#1a0d06" py="4rem">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
           <h2 className="playfair" style={{ fontSize: '2.5rem', color: 'var(--cream)' }}>Civic Administration & Portals</h2>
           <p style={{ color: 'rgba(245,237,216,0.6)' }}>Direct community governance and traditional justice access.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
           <div className="glass card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
             <div>
               <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚖️</div>
               <h3 className="playfair" style={{ fontSize: '1.4rem', color: 'var(--gold)', marginBottom: '0.75rem' }}>Palace Customary Court (Kootu Oba)</h3>
               <p style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.7)', marginBottom: '1rem' }}>File traditional petitions, schedule hearings with High Chiefs & Baales, and obtain binding Royal Decrees.</p>
             </div>
             <div>
               <a href="/disputes" className="btn-gold" style={{ display: 'inline-block', padding: '0.6rem 1.2rem', textDecoration: 'none', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Access Dispute Portal →</a>
             </div>
           </div>
           
           <div className="glass card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
             <div>
               <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚧</div>
               <h3 className="playfair" style={{ fontSize: '1.4rem', color: '#38bdf8', marginBottom: '0.75rem' }}>Fix My Street Civic Tracker</h3>
               <p style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.7)', marginBottom: '1rem' }}>Report potholes, broken transformers, and drainage clogs with GPS coordinates & track IBEDC quarter power grid uptime.</p>
             </div>
             <div>
               <a href="/fix-my-street" className="btn-gold" style={{ display: 'inline-block', padding: '0.6rem 1.2rem', textDecoration: 'none', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', background: 'rgba(56,189,248,0.2)', border: '1px solid #38bdf8', color: '#e0f2fe' }}>Open Street Tracker →</a>
             </div>
           </div>

           <div className="glass card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
             <div>
               <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌍</div>
               <h3 className="playfair" style={{ fontSize: '1.4rem', color: '#4ade80', marginBottom: '0.75rem' }}>Diaspora Escrow Grants</h3>
               <p style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.7)', marginBottom: '1rem' }}>Fund community capital projects with transparent milestone-locked escrow releases and transparent donor ledgers.</p>
             </div>
             <div>
               <a href="/diaspora-escrow" className="btn-gold" style={{ display: 'inline-block', padding: '0.6rem 1.2rem', textDecoration: 'none', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', background: 'rgba(74,222,128,0.2)', border: '1px solid #4ade80', color: '#dcfce7' }}>View Escrow Projects →</a>
             </div>
           </div>
        </div>
      </Section>
    </div>
  );
}
