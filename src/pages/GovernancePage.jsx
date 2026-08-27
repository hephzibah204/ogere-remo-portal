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
           <h2 className="playfair" style={{ fontSize: '2.5rem', color: 'var(--cream)' }}>Community Administration</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
           <div className="glass card" style={{ padding: '2rem', textAlign: 'center' }}>
             <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏛️</div>
             <h3 className="playfair" style={{ fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '1rem' }}>OCDA Meetings</h3>
             <p style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.7)', marginBottom: '1rem' }}>The Ogere Community Development Association meets on the last Saturday of every month at the Town Hall.</p>
             <p style={{ fontSize: '0.75rem', color: '#16a34a' }}>Next Meeting: June 27, 2026</p>
           </div>
           
           <div className="glass card" style={{ padding: '2rem', textAlign: 'center' }}>
             <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚖️</div>
             <h3 className="playfair" style={{ fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '1rem' }}>Palace Arbitration</h3>
             <p style={{ fontSize: '0.85rem', color: 'rgba(245,237,216,0.7)', marginBottom: '1rem' }}>The King's court sits weekly to resolve community disputes peacefully before they escalate to civil courts.</p>
             <p style={{ fontSize: '0.75rem', color: '#d97706' }}>Sitting Days: Tuesdays & Thursdays</p>
           </div>
        </div>
      </Section>
    </div>
  );
}
