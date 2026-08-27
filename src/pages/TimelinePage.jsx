import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';

const TIMELINE_EVENTS = [
  {
    yr: '1401 A.D.',
    t: 'Founding of Ilagere Homestead',
    ic: '🛡️',
    side: 'left',
    img: '/images/Ogere Town.jpg',
    desc: 'Crown Prince Olipakala, an Ile-Ife royal warrior, migrates westward from Ijebu-Ode alongside his companion Yemogun. They settle at \"Agbele\" and found the Homestead, calling it \"Ilagere\" (which later coined down to Ogere). He establishes a powerful war camp that remains undefeated.'
  },
  {
    yr: 'c. 1880s',
    t: 'Consolidation & First Ologere',
    ic: '👑',
    side: 'right',
    img: '/images/ologere-coronation.jpg',
    desc: 'Faced with the frequent threats of the Yoruba intertribal wars, the scattered camps and satellite farming villages consolidate into one fortified town. The native chiefs (Olojas) merge, and Oba Adelana Osifayo (who reigned at Agbele) becomes Legunsen I, the FIRST Ologere of Ogere.'
  },
  {
    yr: 'July 27, 1930',
    t: 'Birth of Aladura Worldwide',
    ic: '⛪',
    side: 'left',
    img: '/images/The Church Of The Lord Aladuara.jpg',
    desc: 'Prophet Josiah Olunowo Ositelu, born in Ogere in 1902 and of the Lisa Chieftaincy compound, formally inaugurates the Church of the Lord (Aladura) Worldwide at the Lisa Compound. The church becomes one of Africa\'s most significant global Pentecostal institutions.'
  },
  {
    yr: '1945 – 1982',
    t: 'The Reign of Legunsen III',
    ic: '👑',
    side: 'right',
    img: '/images/Babington Ashaye Greeting Queen Elizabeth.jpg',
    desc: 'Oba Alfred Obafuwa Babington-Ashaye (Legunsen III) ascends the throne. His distinguished 37-year reign guides Ogere through the twilight of British colonial rule and the dawn of Nigerian independence. In 1956, he meets Queen Elizabeth II during her royal visit to Nigeria.'
  },
  {
    yr: '1983 – 2022',
    t: 'The Long Reign of Agbejoye II',
    ic: '🏺',
    side: 'left',
    img: '/images/OLOGERE-OF-OGERE-OBA OGUNBADE.jpg',
    desc: 'Oba Oladele Moshood Ogunbade (Agbejoye II) is coronated on December 3, 1983. He reigns for over 38 years — the longest modern reign in the town\'s history. In 2008, he compiles the comprehensive Ologere Palace Archives, providing the definitive history of Ogere Remo.'
  },
  {
    yr: 'April 25, 2023',
    t: 'Installation of Kankanbiina II',
    ic: '👑',
    side: 'right',
    img: '/images/Ologere-Oba-James-Obafemi1.jpg',
    desc: 'Following the passing of Agbejoye II, Oba James Obafemi Saliu is appointed and installed as the Ologere of Ogere Remo on April 25, 2023, with his grand coronation ceremony taking place on September 23, 2023.'
  },
  {
    yr: 'April 26, 2025',
    t: 'The Royal Palace & Lipakala Cultural Centre',
    ic: '🏛️',
    side: 'left',
    img: '/images/palace/1.jpg',
    desc: 'Oba James Obafemi Saliu commissions the state-of-the-art Aafin Ologere (Ologere Palace), the first permanent royal palace in modern history, alongside the majestic Lipakala Cultural Centre (/images/lipakala-cultural-centre.jpg) honoring founding prince Olipakala.'
  },
  {
    yr: 'April 2026',
    t: 'FRSC Office Complex Commissioning',
    ic: '🚦',
    side: 'right',
    img: '/images/Ogere FRSC2.jpg',
    desc: 'To bolster expressway security, Oba James Obafemi Saliu constructs and donates a brand new Federal Road Safety Corps (FRSC) office complex along the Lagos-Ibadan Expressway axis on his third coronation anniversary.'
  }
];

export default function TimelinePage() {
  return (
    <div>
      <SEO title="Dynastic Timeline" description="Scroll through the 600-year dynastic history of the Ologere of Ogere Remo, from founding Prince Olipakala in 1401 A.D. to the modern era." />
      <Hero ey="Chronology of Heritage" ti="Dynastic Timeline of Kings" sub="Scroll through 600 years of monarchical rule, royal successions, and community milestones in Ogereland." />
      <AdireDivider />

      <Section bg="#1a0d06" py="4rem">
        <div className="timeline-container">
          
          {/* Vertical central timeline line */}
          <div className="timeline-line" />

          {/* Timeline Nodes */}
          <div style={{ display: 'grid', gap: '3.5rem', position: 'relative', zIndex: 2 }}>
            {TIMELINE_EVENTS.map((ev, index) => {
              const isLeft = ev.side === 'left';
              return (
                <div
                  key={index}
                  className="timeline-item"
                  style={{
                    flexDirection: isLeft ? 'row' : 'row-reverse',
                  }}
                >
                  {/* Left or Right Content Card */}
                  <div
                    className="timeline-card"
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {ev.img && (
                      <div style={{ height: '140px', width: '100%', overflow: 'hidden', borderRadius: 2, marginBottom: '1rem', border: '1px solid rgba(201,150,58,.1)' }}>
                        <img src={ev.img} alt={ev.t} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
                      <span className="tag tag-gold" style={{ margin: 0, fontSize: '.5rem' }}>{ev.yr}</span>
                      <span style={{ fontSize: '1.2rem' }}>{ev.ic}</span>
                    </div>
                    
                    <h3 className="playfair" style={{ fontSize: '1.1rem', color: '#F5EDD8', margin: '0 0 .5rem', lineHeight: 1.25 }}>{ev.t}</h3>
                    <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: 'rgba(245,237,216,.65)', margin: 0 }}>{ev.desc}</p>
                  </div>

                  {/* Centered Node Bullet */}
                  <div className="timeline-bullet">
                    {ev.ic}
                  </div>

                  {/* Empty spacer spacer to balance grid on larger screens */}
                  <div className="timeline-spacer" />
                </div>
              );
            })}
          </div>

        </div>
      </Section>
      <AdireDivider />
    </div>
  );
}
