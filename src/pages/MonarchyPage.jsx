import { kings, notableDescendants, rulingHouses, achievements } from '../data/kings';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';

export default function MonarchyPage() {
  return (
    <div>
      <SEO title="Monarchy" description="The royal lineage and traditional governance of Ogere Remo — from the first Ologere to the reigning monarch." />
      <Hero ey="Royal Institution" ti="The Monarchy of Ogere" sub="The Ologere of Ogere — paramount ruler, spiritual head, and fountain of honour for all of Ogereland." />
      <AdireDivider />

      <Section bg="#1a0d06">
        <p className="sl">Reigning Monarch</p>
        <h2 className="st">HRH Oba James Obafemi Saliu — Kankanbiina II</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '2.5rem', marginTop: '1.5rem', alignItems: 'start' }}>
          <div style={{ background: 'rgba(201,150,58,.08)', border: '1px solid rgba(201,150,58,.28)', padding: '2rem', textAlign: 'center', borderTop: '4px solid #C9963A' }}>
            <img src="/images/Ologere-Oba-James-Obafemi1.jpg" alt="Oba James Obafemi Saliu" style={{ width: '100%', maxWidth: 220, aspectRatio: '1/1', objectFit: 'cover', objectPosition: 'center top', borderRadius: '50%', border: '3px solid #C9963A', marginBottom: '.7rem', margin: '0 auto' }} />
            <div className="cinzel" style={{ fontSize: '.58rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase' }}>Ologere of Ogere Remo</div>
            <div className="playfair" style={{ fontSize: '1.05rem', color: '#F5EDD8', margin: '.5rem 0 .2rem' }}>Oba James Obafemi Saliu</div>
            <div className="cinzel" style={{ fontSize: '.52rem', color: 'rgba(245,237,216,.45)', letterSpacing: '.08em' }}>Kankanbiina II · Ilufemiloye I · Arole Olipakala</div>
            <div style={{ height: 1, background: 'rgba(201,150,58,.18)', margin: '1rem 0' }} />
            {[['Installed', 'April 25, 2023'], ['Coronated', 'September 23, 2023'], ['Ruling House', 'Kankanbina/Ejigboye'], ['Reign', '3rd Year (2026)']].map(([k, v]) => (
              <div key={k} style={{ marginBottom: '.45rem' }}>
                <div className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.08em', color: 'rgba(201,150,58,.5)', textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontSize: '.82rem', color: 'rgba(245,237,216,.7)' }}>{v}</div>
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontSize: '.9rem', lineHeight: 1.9, color: 'rgba(245,237,216,.7)', marginBottom: '1.1rem' }}>Oba James Obafemi Saliu was installed as Ologere of Ogere Remo on April 25, 2023, succeeding the late Oba Oladele Ogunbade (Agbejoye II) who passed on April 10, 2022 after 38 years. His formal coronation ceremony took place on September 23, 2023.</p>
            <p style={{ fontSize: '.9rem', lineHeight: 1.9, color: 'rgba(245,237,216,.7)', marginBottom: '1.3rem' }}>Under his reign, Ogere has witnessed impressive strides in infrastructure and community empowerment. He donated operational vehicles to security agencies, constructed security posts, commissioned the Ologere Palace and Lipakala Cultural Centre, and extended empowerment programmes to all ethnic communities.</p>
            <img src="/images/ologere-coronation.jpg" alt="Coronation of Oba James Obafemi Saliu" style={{ width: '100%', aspectRatio: '16/7', objectFit: 'cover', objectPosition: 'center 30%', borderRadius: 4, marginBottom: '1.5rem', border: '1px solid rgba(201,150,58,.25)' }} />
            <div className="cinzel" style={{ fontSize: '.63rem', letterSpacing: '.14em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '1rem' }}>Landmark Achievements</div>
            {achievements.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '.9rem', padding: '.68rem 1rem', background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.1)', borderLeft: '3px solid #C9963A', marginBottom: '.5rem' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{a.ic}</span>
                <div>
                  <div className="cinzel" style={{ fontSize: '.52rem', letterSpacing: '.08em', color: '#C9963A', textTransform: 'uppercase' }}>{a.d}</div>
                  <div style={{ fontSize: '.8rem', lineHeight: 1.62, color: 'rgba(245,237,216,.65)' }}>{a.t}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div style={{ background: 'rgba(201,150,58,.04)', padding: '1px 0' }}><AdireDivider thin /></div>

      <Section bg="#2c1a0e">
        <p className="sl">Immediate Past Monarch</p>
        <h2 className="st">Oba Oladele Moshood Ogunbade — Agbejoye II</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '2.5rem', marginTop: '1.5rem', alignItems: 'start' }}>
          <div style={{ background: 'rgba(201,150,58,.08)', border: '1px solid rgba(201,150,58,.28)', padding: '2rem', textAlign: 'center', borderTop: '4px solid #7A2E0E' }}>
            <img src="/images/OLOGERE-OF-OGERE-OBA OGUNBADE.jpg" alt="Oba Oladele Ogunbade" style={{ width: '100%', maxWidth: 220, aspectRatio: '1/1', objectFit: 'cover', objectPosition: 'center top', borderRadius: '50%', border: '3px solid #7A2E0E', marginBottom: '.7rem', margin: '0 auto' }} />
            <div className="cinzel" style={{ fontSize: '.52rem', color: 'rgba(245,237,216,.45)', letterSpacing: '.08em' }}>Agbejoye II · Ologere 1983–2022</div>
            <div style={{ height: 1, background: 'rgba(201,150,58,.18)', margin: '1rem 0' }} />
            {[['Born', 'c.1937'], ['Installed', '1983'], ['Passed', 'April 10, 2022'],['Reign', '38 Years']].map(([k, v]) => (
              <div key={k} style={{ marginBottom: '.45rem' }}>
                <div className="cinzel" style={{ fontSize: '.48rem', letterSpacing: '.08em', color: 'rgba(201,150,58,.5)', textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontSize: '.82rem', color: 'rgba(245,237,216,.7)' }}>{v}</div>
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontSize: '.9rem', lineHeight: 1.9, color: 'rgba(245,237,216,.7)', marginBottom: '1.1rem' }}>Oba Oladele Moshood Ogunbade (Agbejoye II) reigned as Ologere of Ogere Remo for 38 years, from 1983 until his passing on April 10, 2022. His reign was one of the longest and most transformative in Ogere's modern history.</p>
            <p style={{ fontSize: '.9rem', lineHeight: 1.9, color: 'rgba(245,237,216,.7)', marginBottom: '1.1rem' }}>Under his leadership, Ogere witnessed significant infrastructural development, educational advancement, and community cohesion. His palace archives, compiled in 2008, remain the primary historical source for Ogere Remo's rich heritage. He is remembered as a wise and progressive monarch who shepherded the town through decades of change while preserving its cultural identity.</p>
            <img src="/images/Ologere-of-Ogere-Remo-HRH-Oba-Oladele-Ogunbade-Agbejoye-II.jpg" alt="Oba Oladele Ogunbade portrait" style={{ width: '100%', aspectRatio: '16/7', objectFit: 'cover', objectPosition: 'center 30%', borderRadius: 4, border: '1px solid rgba(201,150,58,.25)' }} />
          </div>
        </div>
      </Section>

      <div style={{ background: 'rgba(201,150,58,.04)', padding: '1px 0' }}><AdireDivider thin /></div>

      <Section bg="#1a0d06">
        <p className="sl">Notable Past Monarch</p>
        <h2 className="st">Oba Alfred Obafuwa Babington-Ashaye — Legunsen III</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '2.5rem', marginTop: '1.5rem', alignItems: 'start' }}>
          <div style={{ background: 'rgba(201,150,58,.08)', border: '1px solid rgba(201,150,58,.28)', padding: '2rem', textAlign: 'center', borderTop: '4px solid #7A2E0E' }}>
            <img src="/images/Oba-BabingtonAshaye.jpg" alt="Oba Alfred Babington-Ashaye" style={{ width: '100%', maxWidth: 220, aspectRatio: '1/1', objectFit: 'cover', objectPosition: 'center top', borderRadius: '50%', border: '3px solid #7A2E0E', marginBottom: '.7rem', margin: '0 auto' }} />
            <div className="cinzel" style={{ fontSize: '.52rem', color: 'rgba(245,237,216,.45)', letterSpacing: '.08em' }}>Legunsen III · Ologere 1945–1982</div>
            <div style={{ height: 1, background: 'rgba(201,150,58,.18)', margin: '1rem 0' }} />
            {[['Reign', '1945–1982'], ['Ruling House', 'Legunsen'],['Duration', '37 Years']].map(([k, v]) => (
              <div key={k} style={{ marginBottom: '.45rem' }}>
                <div className="cinzel" style={{ fontSize: '.48rem', letterSpacing: '.08em', color: 'rgba(201,150,58,.5)', textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontSize: '.82rem', color: 'rgba(245,237,216,.7)' }}>{v}</div>
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontSize: '.9rem', lineHeight: 1.9, color: 'rgba(245,237,216,.7)', marginBottom: '1.1rem' }}>Oba Alfred Obafuwa Babington-Ashaye (Legunsen III) reigned as Ologere of Ogere Remo from 1945 to 1982 — a distinguished 37-year reign that saw Ogere navigate the final years of colonial rule and the early decades of Nigerian independence.</p>
            <p style={{ fontSize: '.9rem', lineHeight: 1.9, color: 'rgba(245,237,216,.7)', marginBottom: '1.1rem' }}>A highly educated and progressive monarch, he was known for his diplomatic grace — once greeting Queen Elizabeth II during her visit to Nigeria. His royal bearing and statesmanship earned him respect far beyond the borders of Ogere. He is remembered as a brave, wise, and cultured king who elevated the stature of the Ologere throne. His notable descendants include Dr. Shola Mos-Shogbamimu, the renowned lawyer, author and political commentator.</p>
            <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <img src="/images/Babington Ashaye Greeting Queen Elizabeth.jpg" alt="Babington-Ashaye greeting Queen Elizabeth II" style={{ width: 'calc(50% - .3rem)', minWidth: 'min(140px, 100%)', flex: 1, aspectRatio: '4/3', objectFit: 'cover', objectPosition: 'center', borderRadius: 4, border: '1px solid rgba(201,150,58,.25)' }} />
              <img src="/images/Babington Ashaye The Brave King.jpg" alt="Babington-Ashaye portrait" style={{ width: 'calc(50% - .3rem)', minWidth: 'min(140px, 100%)', flex: 1, aspectRatio: '4/3', objectFit: 'cover', objectPosition: 'center', borderRadius: 4, border: '1px solid rgba(201,150,58,.25)' }} />
            </div>
          </div>
        </div>
      </Section>

      <div style={{ background: 'rgba(201,150,58,.04)', padding: '1px 0' }}><AdireDivider thin /></div>

      <Section bg="#2c1a0e">
        <p className="sl">Royal Succession</p>
        <h2 className="st" style={{ marginBottom: '.8rem' }}>The Ologere of Ogere — Confirmed Kings</h2>
        <p className="si" style={{ marginBottom: '2.5rem' }}>The title of the King of Ogere Remo is <strong style={{ color: '#F0D080' }}>Ologere</strong>. Below are the confirmed monarchs from historical records and community archives.</p>
        <div style={{ display: 'grid', gap: '1.1rem' }}>
          {kings.map((k, i) => (
            <div key={i} style={{ padding: '1.6rem', background: k.cur ? 'rgba(201,150,58,.08)' : 'rgba(201,150,58,.03)', border: `1px solid ${k.cur ? 'rgba(201,150,58,.4)' : 'rgba(201,150,58,.12)'}`, borderLeft: `4px solid ${k.cur ? '#C9963A' : '#7A2E0E'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem', marginBottom: '.6rem' }}>
                <div>
                  {k.cur && <span className="tag tag-gold" style={{ display: 'block', marginBottom: '.4rem' }}>Currently Reigning</span>}
                  <div className="playfair" style={{ fontSize: '1.1rem', color: '#F5EDD8' }}>{k.n}</div>
                  <div className="cinzel" style={{ fontSize: '.58rem', letterSpacing: '.1em', color: '#C9963A', textTransform: 'uppercase', marginTop: '.15rem' }}>{k.t}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '.82rem', color: 'rgba(245,237,216,.65)' }}>{k.e}</div>
                  <div className="cinzel" style={{ fontSize: '.52rem', letterSpacing: '.08em', color: 'rgba(201,150,58,.55)', textTransform: 'uppercase', marginTop: '.15rem' }}>{k.h}</div>
                </div>
              </div>
              <div style={{ fontSize: '.82rem', lineHeight: 1.75, color: 'rgba(245,237,216,.62)' }}>{k.note}</div>
              {k.oriki && (
                <div style={{ marginTop: '1rem', background: 'rgba(201,150,58,.06)', border: '1px solid rgba(201,150,58,.18)', borderLeft: '3px solid #C9963A', padding: '1.2rem' }}>
                  <div className="cinzel" style={{ fontSize: '.58rem', letterSpacing: '.14em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.6rem' }}>His Oriki (Royal Praise Poem)</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: '.88rem', lineHeight: 2.1, color: '#F0D080', whiteSpace: 'pre-line' }}>{k.oriki}</div>
                </div>
              )}
              {k.children && (
                <div style={{ marginTop: '.8rem' }}>
                  <div className="cinzel" style={{ fontSize: '.55rem', letterSpacing: '.1em', color: 'rgba(201,150,58,.6)', textTransform: 'uppercase', marginBottom: '.4rem' }}>His Children (as mentioned in Oriki)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                    {k.children.map(c => <span key={c} style={{ fontSize: '.75rem', color: 'rgba(245,237,216,.55)', padding: '.15rem .5rem', border: '1px solid rgba(201,150,58,.15)' }}>{c}</span>)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '3rem' }}>
          <p className="sl">Royal Descendants of Note</p>
          <h2 className="st" style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Descendants of Oba Alfred Babington-Ashaye</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
            {notableDescendants.map((p, i) => (
              <div key={i} className="card" style={{ padding: '1.5rem', borderTop: '3px solid #C9963A' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '.5rem' }}>🌟</div>
                <div className="playfair" style={{ fontSize: '.98rem', color: '#F5EDD8', marginBottom: '.2rem' }}>{p.n}</div>
                <div className="cinzel" style={{ fontSize: '.52rem', letterSpacing: '.08em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.3rem' }}>{p.r}</div>
                <div style={{ fontSize: '.8rem', lineHeight: 1.68, color: 'rgba(245,237,216,.62)', marginBottom: '.3rem' }}>{p.f}</div>
                {p.note && <div style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.38)', fontStyle: 'italic' }}>{p.note}</div>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <p className="sl">Governance</p>
          <h2 className="st" style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>The Four Royal Ruling Houses</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: '1rem' }}>
            {rulingHouses.map(([ic, n, d], i) => (
              <div key={i} className="card" style={{ padding: '1.5rem', borderTop: '3px solid #B5451B' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '.5rem' }}>{ic}</div>
                <div className="cinzel" style={{ fontSize: '.62rem', letterSpacing: '.1em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.4rem' }}>{n}</div>
                <div style={{ fontSize: '.8rem', lineHeight: 1.68, color: 'rgba(245,237,216,.62)' }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <AdireDivider />
    </div>
  );
}
