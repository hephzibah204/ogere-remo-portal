import Hero from '../components/Hero';
import AdireDivider from '../components/AdireDivider';
import Section from '../components/Section';
import SEO from '../components/SEO';

const pStyle = { fontSize: '.9rem', lineHeight: 1.9, color: 'rgba(245,237,216,.72)', marginBottom: '1rem' };
const headingStyle = { fontSize: '.75rem', letterSpacing: '.14em', color: '#C9963A', textTransform: 'uppercase', fontFamily: "'Cinzel',serif", marginBottom: '.5rem' };

export default function HistoryPage() {
  return (
    <div>
      <SEO title="History" description="Discover the rich history of Ogere Remo, from its founding by Olipakala circa 1401 A.D. through the Yoruba Wars to the modern era." />
      <Hero ey="Our Roots" ti="History & Heritage" sub="Six centuries of Yoruba tradition, royal lineage, and community resilience." />
      <AdireDivider />

      <Section bg="#1a0d06">
        <p className="sl">Origins</p>
        <h2 className="st">Ogere Remo — A Town Upon the Hills</h2>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ flex: '1', minWidth: '280px' }}>
            <p style={pStyle}>
              Ogere (also referred to as Ogere Remo or Ogere-Remo), is an ancient town in the present Remo Division of Ogun State, Nigeria. The town was founded around 1401 A.D. Ogere is part of the Ikenne Local Government area of Ogun State.
            </p>
            <p style={pStyle}>
              The ancestral home of the Yorubas is Ile-Ife. Oduduwa is the ancestral father of all the Yorubas inside and outside Nigeria. The people of Ogere are Yorubas. They hailed from the ancestral home "Lagere in Ile-Ife" in two different emigrations led by Olipakala and Lowa-Lida respectively. The two are Ile-Ife crowned Princes.
            </p>
          </div>
          <div style={{ width: '100%', maxWidth: '350px', height: '220px', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(201,150,58,.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', flexShrink: 0 }}>
            <img src="/images/Ogere Town.jpg" alt="Ogere Remo Town landscape upon the hills" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </Section>

      <Section bg="#2c1a0e">
        <p className="sl">Location</p>
        <h2 className="st">Geography & Boundaries</h2>
        <p style={pStyle}>
          Ogere is situated in a hilly area. The topography of the town justifies the biblical saying which states that "A town that is situated on hills cannot be hid."
        </p>
        <p style={pStyle}>
          Ogere is one of the old thirty three towns that made up "Remo Kingdom". It is in the South-West of the Kingdom. Ogere has boundaries in the North with Ajura (An Egba Town), in the South with Iperu Remo, in the East with Ode Remo and in the West with Sagamu Remo. Both the Lagos–Ibadan Expressway and Ijebu-Ode / Abeokuta Road pass through Ogere.
        </p>
      </Section>

      <Section bg="#1a0d06">
        <p className="sl">The People</p>
        <h2 className="st">Occupation & Livelihood</h2>
        <p style={pStyle}>
          The people were principally farmers and traders by profession. They grew rice, kolanut, and cocoa as cash crops. The women traded in gari, rice, provisions and textiles.
        </p>
      </Section>

      <Section bg="#2c1a0e">
        <p className="sl">The Migration</p>
        <h2 className="st">Olipakala — Founder & Warrior Prince</h2>
        <p style={pStyle}>
          Olipakala, an Ile-Ife Crown Prince, a direct descendant of the Yoruba Progenitor Oduduwa and a warrior was the founder, ancestor and spiritual father of the Ogere people.
        </p>
        <p style={pStyle}>
          Olipakala migrated with his senior brother Obanta from Ile-Ife to Ijebu-Ode. His wife Yemogun also travelled with him. They settled at Ijebu-Ode for a while and no sooner had they settled in Ijebu-Ode than Obanta discovered Olipakala to be a strong radical man. He became difficult to control for Obanta and even started to challenge his authority in social and political decisions. As a result, Olipakala was asked to go and settle far away.
        </p>
        <p style={pStyle}>
          Olipakala and his family moved out of Ijebu-Ode and westward. They settled at "Agbele" and called the settlement "Ilagere" where they made their homestead.
        </p>
      </Section>

      <Section bg="#1a0d06">
        <p className="sl">The Second Migration</p>
        <h2 className="st">Lowa-Lida — The Lagere Contingent</h2>
        <p style={pStyle}>
          Another emigration led by Lowa-Eri the founder of Lagere District in Ile-Ife also decided to move out of Ile-Ife to found another settlement. On their journey, Lowa-Eri the leader of the group died at Ipole and Lowa-Lida; his son then became the leader. Lowa-Lida established many villages in Ile-Nla, Ogbo near Ijebu-Ode before his settlement at Idoko (part of Ijebu-Mushin). Oral history claimed that Obinrin-Ojowu was erected at Ijebu-Ode by Lowa-Lida, who left his son Lowa-Iberu as his chief priest.
        </p>
        <p style={pStyle}>
          Lowa-Lida and his group also moved westward from Ijebu-Ode and settled at Agbele Ogere with the Olipakala family. "Aje Shrine in Ogere was erected at the present site, which then was about 1½ miles from Agbele. The Oloja of Iremo who was in Lowa entourage was the Chief Priest. The word "Iremo" was later coined down to Aremo.
        </p>
      </Section>

      <Section bg="#2c1a0e">
        <p className="sl">The Settlement</p>
        <h2 className="st">Life at Ilagere (Agbele)</h2>
        <p style={pStyle}>
          The Lagere people settled in two camps at Agbele and regarded it as their homestead. Olipakala was for many years the absolute ruler of Ilagere people. He established a powerful war camp and an empire. He fought to preserve his people's entity and identity.
        </p>
        <p style={pStyle}>
          Olipakala and his wife Yemogun guarded Lagere (Ogere)'s people and ensured their security from invasion by their neighbouring rival towns. He fought many wars to safeguard his people. His wife Yemogun was a good companion in all the wars. Ogere people were never defeated in any war when Olipakala, Yemogun and Lowa-Lida were alive; hence a cognomen was given to him that runs thus: <em>"Olipakala A Gbe Ni Ma Dehin"</em>.
        </p>
        <p style={pStyle}>
          In times of war their immediate neighbours were contacted by the use of the "Apere" — a war signal drum used for transmitting messages which the enemy would not be able to interpret.
        </p>
      </Section>

      <Section bg="#1a0d06">
        <p className="sl">Expansion</p>
        <h2 className="st">Satellite Villages & Prosperity</h2>
        <p style={pStyle}>
          The settlement of Lagere (Ogere) people was basically a farming community and faced a serious threat from wild animals and an attack by carnivorous animals such as lions, tigers, hyenas and wolves particularly at dusk and in the evening. Efforts were made to kill these animals.
        </p>
        <p style={pStyle}>
          After the conquest of wild animals with greater security of life, farming activities expanded and Olipakala settlement enjoyed a period of peace and prosperity. Other settlements sprang up as satellite of Agbele settlement. These include Iporo I and II, Orile-Epe, Iseje, Lowosiwu, Larufin, Ipakala, Sakale, Obelu, Idoko, Oke Mogun and Ejigun. It was through the help of these divinities that Ogere has come to stay in its present location.
        </p>
      </Section>

      <Section bg="#2c1a0e">
        <p className="sl">The Ancestors</p>
        <h2 className="st">Exit of Olipakala — Deification & Worship</h2>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ flex: '1', minWidth: '280px' }}>
            <p style={pStyle}>
              Olipakala became old and disappeared as well as Yemogun and Lowa-Lida. In appreciation, the people of Ogere deified and worshipped them annually. They were consulted on matters of war and for the general prosperity of the town.
            </p>
            <p style={pStyle}>
              The people established an Olipakala Grove called <em>"Igbo Olipakala"</em> and Yemogun Grove called <em>"Igbo Yeye"</em>. Ogere's people venerated them with reverence for they are regarded as a <em>"Mysterium tremendum et fascinons"</em> by the people.
            </p>
            <p style={pStyle}>
              The festival during which Olipakala is remembered and worshipped is called <em>"Oro Olipakala"</em> and that of Yemogun is <em>"Obalufon"</em> festival. These festivals are annual events.
            </p>
            <p style={pStyle}>
              The exit of Olipakala led to the substantial reorganisation of Lagere (Ogere)'s Society. It is common knowledge that from time immemorial, people lived by their might and the weak easily fell prey to the strong. With Olipakala around no war ever conquered his people; even after his departure his spirit still gave strong support to the people but taught them lessons anytime they disobeyed his orders.
            </p>
          </div>
          <div style={{ width: '100%', maxWidth: '350px', height: '230px', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(201,150,58,.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', flexShrink: 0 }}>
            <img src="/images/Miss Lipaka Hero.jpg" alt="Commemoration of Olipakala Ancestral Legacy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </Section>

      <Section bg="#1a0d06">
        <p className="sl">Governance</p>
        <h2 className="st">The Ruling Council & Establishment of Obaship</h2>
        <p style={pStyle}>
          The monarch is a divine creation on earth, or a man made institution designed as a rallying point in the society. Very many years after Olipakala had left the stage the settlers at Agbele who had multiplied astronomically decided to establish Obaship Rule and the two Royal Ruling Houses that emerged are:
        </p>
        <ul style={{ ...pStyle, listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '.3rem 0', borderBottom: '1px solid rgba(201,150,58,.1)' }}>👑 Legunsen</li>
          <li style={{ padding: '.3rem 0', borderBottom: '1px solid rgba(201,150,58,.1)' }}>👑 Negbua (now known as Agbejoye / Fadagbuwa)</li>
        </ul>
        <p style={pStyle}>
          The name Ogere is from Ilagere — that was the name of the town at Agbele. Another interpretation by some people is that Ogere was from <em>"sun si Okere"</em> i.e. "move afar" as decreed by Obanta to Olipakala.
        </p>
      </Section>

      <Section bg="#2c1a0e">
        <p className="sl">Consolidation</p>
        <h2 className="st">The Fortified Town & First Ologere</h2>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ flex: '1', minWidth: '280px' }}>
            <p style={pStyle}>
              The intertribal wars ranging throughout the Yoruba land early 1880s and the frequent invasion of the camp at Agbele and its satellite villages taught the Ilagere people a lasting lesson to come together and establish a fortified town.
            </p>
            <p style={pStyle}>
              The different headmen of these settlements who were entitled the Olojas were merged into one head, with Oba Adelana Osifayo Legunsen 1st who was on the throne at Agbele. Lowa being aged lived with the people at Ogere before he descended alive.
            </p>
            <p style={pStyle}>
              Oba Adelana Osifayo was the third Oba to reign at Agbele and was the Oba on throne at the time of resettlement at Ogere. He therefore became the first Ologere of Ogere.
            </p>
          </div>
          <div style={{ width: '100%', maxWidth: '350px', height: '220px', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(201,150,58,.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', flexShrink: 0 }}>
            <img src="/images/ologere-coronation.jpg" alt="Traditional Coronation Ceremony of the Ologere" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
          </div>
        </div>
      </Section>

      <Section bg="#1a0d06">
        <p className="sl">Ruling Houses</p>
        <h2 className="st">The Four Royal Houses</h2>
        <p style={pStyle}>Four Ruling Houses were established in the following orders:</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem', marginTop: '1rem', marginBottom: '2rem' }}>
          {[
            { n: 'Legunsen', ic: '👑' },
            { n: 'Agbejoye / Fadagbuwa', ic: '👑' },
            { n: 'Kankanbina / Ejigboye', ic: '👑' },
            { n: 'Oregunsen', ic: '👑' },
          ].map((h, i) => (
            <div key={i} style={{ padding: '1.2rem', background: 'rgba(201,150,58,.06)', border: '1px solid rgba(201,150,58,.2)', borderLeft: '3px solid #C9963A' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '.3rem' }}>{h.ic}</div>
              <div className="cinzel" style={{ fontSize: '.6rem', letterSpacing: '.1em', color: '#C9963A', textTransform: 'uppercase' }}>{h.n}</div>
            </div>
          ))}
        </div>
        <p style={pStyle}>
          The Oba (Ologere) thus emerged as the leader and head of civil administration in whose name all acts of government were carried out. The system in Ogere like the rest of Yoruba land was one of limited monarchy. Oba Ologere was the spiritual head of Ogere people; his supremacy over Ogere people was accepted. The person of Ologere was regarded as the fountain of honour, conferred chieftaincies and other honours on worthy sons and daughters of Ogere who must have made substantial contributions towards the economic, social and political growth of the community or have distinguished themselves in their respective professions that the Oba can be proud of them.
        </p>
        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', marginTop: '1.5rem', justifyContent: 'center' }}>
          <div style={{ flex: '1', minWidth: 'min(260px, 100%)', height: '190px', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(201,150,58,.25)', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', position: 'relative' }}>
            <img src="/images/Babington Ashaye Greeting Queen Elizabeth.jpg" alt="Oba Alfred Babington-Ashaye greeting Queen Elizabeth II" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, insetX: 0, padding: '0.4rem', background: 'rgba(0,0,0,0.6)', fontSize: '0.66rem', color: '#F5EDD8', textAlign: 'center' }}>Oba Alfred Babington-Ashaye greeting Queen Elizabeth II</div>
          </div>
          <div style={{ flex: '1', minWidth: 'min(260px, 100%)', height: '190px', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(201,150,58,.25)', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', position: 'relative' }}>
            <img src="/images/Babington Ashaye The Brave King.jpg" alt="Oba Alfred Babington-Ashaye - Legunsen III" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, insetX: 0, padding: '0.4rem', background: 'rgba(0,0,0,0.6)', fontSize: '0.66rem', color: '#F5EDD8', textAlign: 'center' }}>Oba Alfred Babington-Ashaye (Legunsen III)</div>
          </div>
        </div>
      </Section>

      <Section bg="#2c1a0e">
        <p className="sl">Ancient Administration</p>
        <h2 className="st">Political Societies & Democratic Governance</h2>
        <p style={pStyle}>The ancient administration of Ogere was democratic. There were political societies which had functions to carry out.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { t: 'The Osugbo Council', ic: '⚖️', d: 'They shared the day-to-day administration of the community with the Oba. The Osugbo was the main enforcement authority and therefore the most dreaded body. It was usually called Ogboni who met regularly in the "Iledi". The head of the Osugbo is the Oliwo and the secretary and High Priest is the Apena. Other officers include the Iwarefas, Olotu Ijo, Olotu Egan, and Olotu Erelu (Judiciary / Legislative).' },
            { t: 'The Ihare', ic: '🏛️', d: 'The body of Traditional Chiefs — it comprises chiefs such as Olisa, Aro, Odofin, Family Chieftains and Honorary Chieftaincies (Executive).' },
            { t: 'The Olopere', ic: '⚔️', d: 'Headed by Balogun of the town, took over military responsibilities of the community. It was open to all young men of the town. The body comprises traditional Chiefs like Asiwaju, Otun, Osi, Seriki, Ashipa, Bada, Aare etc.' },
            { t: 'The Pampa Society', ic: '🛒', d: 'This took charge of Trade and commerce and township market.' },
            { t: 'The Oro Society', ic: '🔦', d: 'This constituted the police.' },
            { t: 'The Eluku Society', ic: '⚰️', d: 'This was the executioner.' },
            { t: 'The Ode Group', ic: '🛡️', d: 'This was in charge of community security.' },
            { t: 'Other Societies', ic: '🎭', d: 'Other groups or societies are the Alagemo, Elegun etc.' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(201,150,58,.04)', border: '1px solid rgba(201,150,58,.12)', borderLeft: '3px solid #C9963A' }}>
              <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>{s.ic}</div>
              <div>
                <div className="cinzel" style={{ fontSize: '.58rem', letterSpacing: '.1em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.2rem' }}>{s.t}</div>
                <p style={{ fontSize: '.8rem', lineHeight: 1.7, color: 'rgba(245,237,216,.65)', margin: 0 }}>{s.d}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={pStyle}>
          Power was well-shared to the social advancement of the community under the royal headship of the Oba (Ologere). The rest of the community belonged to one traditional religion or the other. The main social organisation was the Egbe or the Age Group.
        </p>
      </Section>

      <Section bg="#1a0d06">
        <p className="sl">Town Divisions</p>
        <h2 className="st">Wards, Quarters & Compounds</h2>
        <p style={pStyle}>
          The town was divided into two principal wards namely: <strong>Itajiren</strong> and <strong>Oke-Lisa (Oke-Ilu)</strong>. Each ward was further divided into quarters called "Itun" and each "Itun" comprised one or more compounds.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ padding: '1.2rem', background: 'rgba(201,150,58,.06)', border: '1px solid rgba(201,150,58,.2)', borderTop: '3px solid #C9963A' }}>
            <div className="cinzel" style={{ fontSize: '.6rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.6rem' }}>Itajiren Ward</div>
            {['Itun-Iseje', 'Morisagbara', 'Itun-Okuta', 'Itun-Oke', 'Itun-Epe', 'Itun-Agbon', 'Itun-Nla', 'Idaren'].map((q, i) => (
              <div key={i} style={{ padding: '.25rem 0', borderBottom: '1px solid rgba(201,150,58,.08)', fontSize: '.82rem', color: 'rgba(245,237,216,.65)' }}>{q}</div>
            ))}
          </div>
          <div style={{ padding: '1.2rem', background: 'rgba(201,150,58,.06)', border: '1px solid rgba(201,150,58,.2)', borderTop: '3px solid #C9963A' }}>
            <div className="cinzel" style={{ fontSize: '.6rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.6rem' }}>Oke-Ilisa Ward</div>
            {['Itun-Iraye', 'Itun-Maro', 'Itun-Ilisa', 'Itun-Idomogun', 'Itun-Aledo'].map((q, i) => (
              <div key={i} style={{ padding: '.25rem 0', borderBottom: '1px solid rgba(201,150,58,.08)', fontSize: '.82rem', color: 'rgba(245,237,216,.65)' }}>{q}</div>
            ))}
          </div>
        </div>
        <p style={pStyle}>
          Each compound has a head called "Baale" with other officers to assist him in the administration of the compound. The officers held regular meetings at the Baale's house to discuss matters affecting their people, settle minor civil matters and burial arrangements of the head etc.
        </p>
        <p style={pStyle}>
          In addition to the above division, there have been modern divisions such include Araromi, Ayegbami, Ayetoro, Ajegunle, Mosimi, Wasimi, Lowa etc. Thus Oba Ologere was seen as a democratic head that carried his people along with him in his decisions. This shows that Ogere people have always been an organised society. They have never lacked ideas on the development of their community. The Obas have always been at the helm of affairs at the township level where they shoulder big problems of administration.
        </p>
      </Section>

      <Section bg="#2c1a0e">
        <p className="sl">Modern Era</p>
        <h2 className="st">Colonial Influence & Independence</h2>
        <p style={pStyle}>
          The advent of the Europeans towards the end of the nineteenth century did not change the concept but rather it tried to strengthen democracy by superimposing the Western System of Administration on the already existing system. We have had Residents, District Officers, Native Courts, Customary Courts etc.
        </p>
        <p style={pStyle}>
          With the introduction of party politics and independence in 1960, the Oba (Ologere) has been working under a difficult, modern and dynamic situation. Despite this, the big responsibilities of the Oba towards his community as the leader have not waned. The different political societies continued to function effectively, helping the Ologere to maintain law and order in the town.
        </p>
        <p style={pStyle}>
          The Ogere Community Development Council (OCDC) also helped the Oba in carrying out some developments in the town. Since the disappearance of Olipakala, Ogere has been a well-organised community with a very high sense of political and social integration and stability.
        </p>
      </Section>

      <Section bg="#1a0d06">
        <div style={{ maxWidth: 550, margin: '0 auto', textAlign: 'center' }}>
          <p className="sl">Our Song</p>
          <h2 className="st" style={{ marginBottom: '1.5rem' }}>The Ogere Anthem — Ilu Mi</h2>
          <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: '1.1rem', lineHeight: 2.3, color: '#F0D080', padding: '2rem', background: 'rgba(201,150,58,.06)', border: '1px solid rgba(201,150,58,.2)', borderLeft: '4px solid #C9963A' }}>
            <div>Ilu mi (2ce),</div>
            <div>Ilu Ogere,</div>
            <div>O dara O lewa,</div>
            <div>Ni 'lu to tobi,</div>
            <div>Kosi bi kibi timolewa lorile aye,</div>
            <div>Timo le gbagbe Ilu Ogere.</div>
          </div>
          <p style={{ marginTop: '.8rem', fontSize: '.72rem', color: 'rgba(245,237,216,.35)' }}>
            My town, my town — the town of Ogere. It is good and beautiful, it is a great town. There is no place as beautiful on this earth. I can never forget Ogere.
          </p>
        </div>
      </Section>

      <AdireDivider />
    </div>
  );
}
