import { useState, useEffect, useRef } from 'react';
import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';

const KINGS_ORIKI = [
  {
    id: 'adelana',
    name: 'Oba Adelana Osifayo',
    title: 'Legunsen I (r. c. 1880s)',
    img: '/images/ologere-coronation.jpg',
    desc: 'The founding monarch of modern Ogere Remo who consolidated the Agbele war camps into the fortified town following the Yoruba Wars.',
    oriki: [
      { yr: 'Oloja Adelana Osifayo Legunsen kin-in-ni.', en: 'Oloja Adelana Osifayo, Legunsen the First.' },
      { yr: 'Omo a ji fojo patako, omo alara rere.', en: 'Child of the one who awakes to royal boards, heir of outstanding grace.' },
      { yr: 'Ologere aafin to gberi re toke Agbele wa.', en: 'Ologere of the palace, who brought his majestic crown from the heights of Agbele.' },
      { yr: 'Omo afidi pote mole, alase to gbe ilu ro.', en: 'Child of the one who quashed rebellions and shepherded the town into peace.' }
    ]
  },
  {
    id: 'alfred',
    name: 'Oba Alfred Obafuwa Babington-Ashaye',
    title: 'Legunsen III (r. 1945–1982)',
    img: '/images/Babington Ashaye The Brave King.jpg',
    desc: 'The legendary, highly educated monarch who reigned for 37 years. Famous for his diplomatic bearing and meeting Queen Elizabeth II in 1956.',
    oriki: [
      { yr: 'Agbalajobi-Erinjogunola, Omo Otunbade, Omo Jawo ni di agbalagba.', en: 'Elder-born of noble status, child of Otunbade, child of those who grasp secrets from elders.', note: 'Otunbade: Chieftaincy title denoting Otis / Otun.' },
      { yr: 'Oba nla to n gbadobale Oba. Omo Lipakala agbeni madein,', en: 'A great king to whom other kings pay homage. Child of Lipakala, the protector who never retreats.', note: 'Olipakala: The warrior prince of Ile-Ife and founder of Ogere Remo (circa 1401 A.D.).' },
      { yr: 're folugboro oloyo poyo, o fi Ori oloyo dakere.', en: 'Who wields ancient authority and secures triumph over adversaries.' },
      { yr: 'Omo Yemogun atatameti, elebiripo ijimiji,', en: 'Child of Yemogun, swift and dynamic in wisdom.', note: 'Yemogun: The deified guardian mother of the Ogere people and companion of Olipakala.' },
      { yr: 'ti sale ko jina, ti toke jinna,', en: 'Close to the valleys, far-reaching from the heights.' },
      { yr: 'Omo Ogere mogbo, Ogere ota, ni le onireke.', en: 'Child of Ogere, listener of the forest, dweller of the land of sugarcane.', note: 'Ogere Onireke: \"Ogere of sugarcane,\" referring to the town\'s historical agricultural abundance.' },
      { yr: 'Omo itun epe, agbade sori yan gbendeke,', en: 'Child of Itun Epe, crowned in absolute majesty and pride.' },
      { yr: 'Omo olowo Joye Meji po, o tun reti eketa.', en: 'Child of the wealthy one who holds two titles and prepares for the third.' },
      { yr: 'Omo arojojoye, adele tejiteji. Ojoye titi, o tun je sikuloye.', en: 'Child of the one who enjoys chieftaincies in successions.' },
      { yr: 'ojoye koye wun niije. Borokini dara dele ko to joba,', en: 'A title holder whose royalty inspires. A noble leader from home before ascending the throne,' },
      { yr: 'aguntaso lo, olowo ladugbo baba Tinuade.', en: 'Draped in white robes, a prosperous beacon for Tinuade\'s father.' },
      { yr: 'Oko dudu, oko pupa, oko Borokini baba Ademola.', en: 'Husband to dark and fair beauties, father to Ademola.' },
      { yr: 'Ara Ijebu ode, Ijebu Ode-ajagbalura,', en: 'Native of Ijebu-Ode, with deep ancestral ties to the Ijebu-Remo kingdoms.' },
      { yr: 'eyin lomo a fidi pote mole, alagemo merindinlogun,', en: 'Descendant of those who quash rebellions, child of the sixteen Alagemo masquerades.', note: 'Alagemo: The sacred Agemo deity of the Ijebu-Remo people, with sixteen traditional seats.' },
      { yr: 'Omo alagemo abijo wenewene. Omo Lagere, lagboole Iremo.', en: 'Child of Alagemo who dances with supreme grace. Child of Lagere, from Iremo compound.', note: 'Lagere: The original district in Ile-Ife from where the founders migrated.' },
      { yr: 'Nile Ife Odaaye ni bi ojumo ti n mo wa,', en: 'From Ile-Ife Odaaye, where the dawn of the universe begins.' },
      { yr: 'enu lo n jibo ni le baba to bi yin lomo.', en: 'Where prayers are uttered to welcome a brand new day.' },
      { yr: 'Kabiyeesi alase, igbakeji orisa,', en: 'All Hail Your Majesty, ruler, companion of the divinities.', note: 'Kabiyeesi: Traditional Yoruba royal salute meaning \"The monarch whose authority is unquestionable.\"' },
      { yr: 'Orisa nla to n biologbo leru.', en: 'The great entity whose power commands absolute reverence.' },
      { yr: 'Didun ni iranti olododo...', en: 'Sweet is the memory of the righteous...' }
    ]
  },
  {
    id: 'moshood',
    name: 'Oba Oladele Moshood Ogunbade',
    title: 'Agbejoye II (r. 1983–2022)',
    img: '/images/OLOGERE-OF-OGERE-OBA OGUNBADE.jpg',
    desc: 'The longest-reigning modern monarch of Ogere Remo who shepherded the town through 38 years of immense growth, and documented the Ologere Palace Archives (2008).',
    oriki: [
      { yr: 'Ogunbade Agbejoye Arole Olipakala.', en: 'Ogunbade Agbejoye, Representative of Olipakala.' },
      { yr: 'Omo Gbenlokun nla, omo otun oloja.', en: 'Child of Gbenlokun the Great, child of the noble market ruler.' },
      { yr: 'Oba to rejo lori ite ologo, to gbe ilu ga.', en: 'The king who reigned peacefully on the glorious throne and elevated the town.' },
      { yr: 'A-se-igba-dun-se-keji-ododo.', en: 'Whose era was a sweet season of justice and prosperity.' }
    ]
  },
  {
    id: 'james',
    name: 'Oba James Obafemi Saliu',
    title: 'Kankanbiina II (r. 2023–Present)',
    img: '/images/Ologere-Oba-James-Obafemi1.jpg',
    desc: 'The currently reigning Ologere, under whose royal vision the permanent royal palace and the Lipakala Cultural Centre were commissioned in 2025.',
    oriki: [
      { yr: 'Oba James Obafemi Saliu, Kankanbiina a-gbe-ni-kin-in-ni.', en: 'Oba James Obafemi Saliu, Kankanbiina the guardian protector.' },
      { yr: 'Ilufemiloye, arole Oba Adelana Osifayo.', en: 'Chosen by the town to reign, successor to Oba Adelana.' },
      { yr: 'Omo Kankanbiina ti n gbogbo ilu ro bi oya.', en: 'Child of Kankanbiina ruling house who commands unity and strength.' },
      { yr: 'Kabiyesi Oba alase, ki ade pe lori, ki bata pe lese!', en: 'Kabiyesi Oba the ruler, may your crown stay long on your head, and royal shoes on your feet!' }
    ]
  }
];

export default function OrikiPage() {
  const [selectedKing, setSelectedKing] = useState(KINGS_ORIKI[1]);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [hoveredNote, setHoveredNote] = useState(null);
  const lyricsEndRef = useRef(null);
  const playIntervalRef = useRef(null);

  // Equalizer wave simulation bars
  const [waveHeights, setWaveHeights] = useState(Array(24).fill(10));

  useEffect(() => {
    if (playing) {
      playIntervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          const nextTime = prevTime + 1;
          if (nextTime >= selectedKing.oriki.length) {
            setPlaying(false);
            clearInterval(playIntervalRef.current);
            return 0;
          }
          return nextTime;
        });

        // Simulate dancing equalizer waveform
        setWaveHeights(Array(24).fill(0).map(() => Math.floor(Math.random() * 45) + 8));
      }, 1800);
    } else {
      clearInterval(playIntervalRef.current);
      setWaveHeights(Array(24).fill(10));
    }

    return () => clearInterval(playIntervalRef.current);
  }, [playing, selectedKing]);

  useEffect(() => {
    // Reset playhead on king change
    setPlaying(false);
    setTime(0);
  }, [selectedKing]);

  const togglePlay = () => {
    setPlaying(!playing);
  };

  const handleLineClick = (idx) => {
    setTime(idx);
    if (!playing) setPlaying(true);
  };

  return (
    <div>
      <SEO title="Interactive Oriki Player" description="Experience the interactive Yoruba Oriki (Praise Poetry) of the Ologere ruling dynasties with real-time synchronized English translation." />
      <Hero ey="Yoruba Praise Poetry" ti="Traditional Oriki Player" sub="Experience the interactive, synchronized chanting of the Ologere Kings of Ogere Remo — connecting you to Yoruba royal roots." />
      <AdireDivider />

      <Section bg="#1a0d06" py="3rem">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* LEFT: King Selector & Dashboard */}
          <div style={{ display: 'grid', gap: '1.2rem' }}>
            <div style={{ background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.2)', padding: '1.5rem', borderTop: '4px solid #C9963A', borderRadius: 4 }}>
              <p className="sl">Royal Lineage Chants</p>
              <h3 className="playfair" style={{ fontSize: '1.35rem', color: '#F5EDD8', marginBottom: '1rem' }}>Select Ologere Monarch</h3>
              <div style={{ display: 'grid', gap: '.8rem' }}>
                {KINGS_ORIKI.map((k) => {
                  const isSel = selectedKing.id === k.id;
                  return (
                    <button
                      key={k.id}
                      onClick={() => setSelectedKing(k)}
                      style={{
                        padding: '1rem',
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center',
                        background: isSel ? 'rgba(201,150,58,.12)' : 'rgba(201,150,58,.03)',
                        border: `1px solid ${isSel ? 'rgba(201,150,58,.5)' : 'rgba(201,150,58,.15)'}`,
                        color: 'inherit',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.25s',
                        borderRadius: 3
                      }}
                    >
                      <div style={{ width: 45, height: 45, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${isSel ? '#C9963A' : 'rgba(201,150,58,.3)'}`, flexShrink: 0 }}>
                        <img src={k.img} alt={k.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <div className="playfair" style={{ fontSize: '0.85rem', color: isSel ? '#F5EDD8' : 'rgba(245,237,216,.7)', fontWeight: isSel ? 600 : 400 }}>{k.name}</div>
                        <div className="cinzel" style={{ fontSize: '0.48rem', letterSpacing: '.06em', color: 'rgba(201,150,58,.6)', marginTop: '.15rem' }}>{k.title}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Monarch Info Card */}
            <div style={{ background: 'rgba(44,26,14,.5)', border: '1px solid rgba(201,150,58,.15)', padding: '1.5rem', borderRadius: 4 }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '.8rem' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', border: '2px solid #C9963A' }}>
                  <img src={selectedKing.img} alt={selectedKing.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <h4 className="playfair" style={{ fontSize: '1rem', color: '#F5EDD8', margin: 0 }}>{selectedKing.name}</h4>
                  <span className="tag tag-gold" style={{ margin: '.2rem 0 0', fontSize: '.42rem' }}>{selectedKing.title}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.7, color: 'rgba(245,237,216,.65)', margin: 0 }}>{selectedKing.desc}</p>
            </div>
          </div>

          {/* RIGHT: Glowing Audio Console & scrolling synchronized lyrics */}
          <div style={{ background: 'rgba(13,7,4,.85)', border: '1px solid rgba(201,150,58,.3)', borderTop: '4px solid #C9963A', padding: '2rem', borderRadius: 4, position: 'relative' }}>
            
            {/* Visualizer Box */}
            <div style={{ padding: '1rem', background: '#0d0704', border: '1px solid rgba(201,150,58,.15)', borderRadius: 4, marginBottom: '1.5rem', textAlign: 'center', boxShadow: 'inset 0 4px 30px rgba(0,0,0,0.8)' }}>
              <div className="cinzel" style={{ fontSize: '0.55rem', letterSpacing: '.2em', color: 'rgba(201,150,58,.5)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                {playing ? '🎙️ Simulated Traditional Chants Playing...' : '🔇 Simulated Audio Waveform'}
              </div>
              
              {/* Dynamic waveform visualizer equalizer */}
              <div style={{ display: 'flex', gap: '4px', height: '60px', alignItems: 'center', justifyContent: 'center', margin: '0.8rem 0' }}>
                {waveHeights.map((h, wi) => (
                  <div
                    key={wi}
                    style={{
                      width: '6px',
                      height: `${h}px`,
                      background: playing ? 'linear-gradient(to top, #7A2E0E, #C9963A)' : 'rgba(201,150,58,.2)',
                      borderRadius: '2px',
                      transition: 'height 0.15s ease'
                    }}
                  />
                ))}
              </div>

              {/* Media Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '1.2rem' }}>
                <button
                  onClick={togglePlay}
                  style={{
                    background: '#B5451B',
                    border: 'none',
                    borderRadius: '50%',
                    width: 50,
                    height: 50,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F5EDD8',
                    fontSize: '1.4rem',
                    boxShadow: '0 4px 15px rgba(181,69,27,0.4)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {playing ? '⏸' : '▶'}
                </button>
                <div style={{ textAlign: 'left' }}>
                  <div className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.12em', color: 'rgba(245,237,216,.45)' }}>Progress Timeline</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '.78rem', color: '#F0D080', marginTop: '.1rem' }}>
                    {String(time + 1).padStart(2, '0')} / {String(selectedKing.oriki.length).padStart(2, '0')} lines
                  </div>
                </div>
              </div>
            </div>

            {/* Scrolling Synchronized Lyrics Display */}
            <div style={{ background: '#0d0704', padding: '1rem', border: '1px solid rgba(201,150,58,.1)', borderRadius: 4, maxHeight: '350px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gap: '1.2rem' }}>
                {selectedKing.oriki.map((item, index) => {
                  const isCurrent = time === index;
                  return (
                    <div
                      key={index}
                      onClick={() => handleLineClick(index)}
                      style={{
                        padding: '.6rem .8rem',
                        background: isCurrent ? 'rgba(201,150,58,.08)' : 'transparent',
                        borderLeft: `3px solid ${isCurrent ? '#C9963A' : 'transparent'}`,
                        cursor: 'pointer',
                        transition: 'all 0.25s',
                        borderRadius: 3
                      }}
                      onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = 'rgba(201,150,58,.03)'; }}
                      onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Yoruba Verse Chants */}
                      <div
                        style={{
                          fontSize: '0.92rem',
                          color: isCurrent ? '#F0D080' : 'rgba(245,237,216,.65)',
                          fontFamily: "'Playfair Display', serif",
                          fontStyle: 'italic',
                          fontWeight: isCurrent ? 600 : 400,
                          lineHeight: 1.45
                        }}
                      >
                        {item.yr}
                      </div>

                      {/* English Synchronized Translation */}
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: isCurrent ? '#a4c4f5' : 'rgba(245,237,216,.38)',
                          marginTop: '.28rem',
                          lineHeight: 1.4
                        }}
                      >
                        {item.en}
                      </div>

                      {/* Highlighted foot-note indicator if word annotation exists */}
                      {item.note && isCurrent && (
                        <div
                          onMouseEnter={() => setHoveredNote(item.note)}
                          onMouseLeave={() => setHoveredNote(null)}
                          style={{
                            display: 'inline-block',
                            marginTop: '.4rem',
                            fontSize: '.56rem',
                            fontFamily: "'Cinzel',serif",
                            color: '#C9963A',
                            borderBottom: '1px dotted #C9963A',
                            cursor: 'help'
                          }}
                        >
                          📜 View Translation Footnote
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={lyricsEndRef} />
              </div>
            </div>

            {/* Footnote hover popup panel */}
            {hoveredNote && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '2rem',
                  left: '2rem',
                  right: '2rem',
                  padding: '1rem',
                  background: 'rgba(44,26,14,.98)',
                  border: '1px solid #C9963A',
                  borderLeft: '4px solid #C9963A',
                  borderRadius: 4,
                  fontSize: '.75rem',
                  lineHeight: 1.6,
                  color: '#F5EDD8',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
                  zIndex: 20,
                  animation: 'fadeUp 0.2s ease both'
                }}
              >
                <div className="cinzel" style={{ fontSize: '.52rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.3rem' }}>Cultural Glossary</div>
                {hoveredNote}
              </div>
            )}

          </div>

        </div>
      </Section>
      <AdireDivider />
    </div>
  );
}
