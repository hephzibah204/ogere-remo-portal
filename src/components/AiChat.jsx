import { useState, useRef, useEffect } from 'react';
import { sendChatMessages } from '../services/openrouter';

const SYSTEM_PROMPT = `You are the official AI assistant for the Ogere Remo Community Portal. Ogere Remo is an ancient Yoruba town in Ogun State, Nigeria, founded circa 1401 A.D. by Olipakala, Crown Prince of Ile-Ife.

You help visitors with questions about:
- History & heritage (Olipakala, Yemogun, Yoruba Wars)
- Monarchy (Ologere, ruling houses, current Oba James Obafemi Saliu)
- Tourism (Ogere Resort, Aafin Ologere Palace, Lipakala Cultural Centre, the hills)
- Events (Lipakala Day Festival, Obalufon Festival, Oro Festival)
- Education (Ositelu Memorial College, Christ Church School)
- Faith & Culture (Church of the Lord Aladura, traditional societies)
- Emergency contacts (Police, FRSC, So-Safe, Ambulance)
- Business directory, Diaspora network, Community forum
- Miss Olipakala beauty pageant
- Weather, map locations, associations (OCDA, OYDA)

Keep answers concise, warm, and informative. If you don't know something, say so. Use Yoruba greetings occasionally (Ẹ káàbọ̀, Ẹ ṣéun, etc.). Never make up specific facts about Ogere Remo.`;

const QUICK_ACTIONS = [
  'Tell me about Ogere history',
  'Who is the current Oba?',
  'What is Lipakala Day?',
  'Emergency contacts',
  'Tourist attractions',
];

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const getLocalAnswer = (text) => {
    const q = text.toLowerCase();
    if (q.includes('history') || q.includes('found') || q.includes('1401')) {
      return 'Ẹ káàbọ̀! Ogere Remo was founded circa 1401 A.D. by Olipakala, Crown Prince of Ile-Ife and a great hunter and warrior who settled upon the sacred hills. Ogere is one of the 33 historic towns of Remo kingdom in Ogun State, Nigeria.';
    }
    if (q.includes('oba') || q.includes('king') || q.includes('ologere') || q.includes('james')) {
      return 'The reigning monarch of Ogere Remo is His Royal Highness Oba James Obafemi Saliu (Kankanbiina II), the Ologere of Ogere Remo. He ascended the throne following his coronation and rules in harmony with the Ologere-in-Council and traditional kingmakers.';
    }
    if (q.includes('lipakala') || q.includes('festival') || q.includes('pageant')) {
      return 'Lipakala Day is the flagship annual cultural festival of Ogere Remo celebrating our founding father Olipakala. It features the Miss Olipakala Beauty Pageant, traditional masquerade processions, community awards, and fundraising. The landmark 50th Golden Jubilee edition is in 2026!';
    }
    if (q.includes('emergency') || q.includes('police') || q.includes('security') || q.includes('phone') || q.includes('help')) {
      return 'Emergency Contacts for Ogere Remo:\n• Police Emergency / General: 112\n• Ogere Police Station (DPO): 08081762371\n• FRSC Road Safety: 122\n• So-Safe Corps: 08034681687\n• Ogun State Ambulance: 08112000033\nFor full listings, visit the Security Alerts page.';
    }
    if (q.includes('touris') || q.includes('visit') || q.includes('resort') || q.includes('attraction') || q.includes('hotel')) {
      return 'Key attractions in Ogere Remo include:\n1. Ogere Resort & Convention Centre (KM 67, Lagos-Ibadan Expressway)\n2. Aafin Ologere & Lipakala Cultural Centre\n3. The Ancient Ogere Hills\n4. Central Oja Ale Market\n5. Historic Aladura World Headquarters.';
    }
    if (q.includes('id') || q.includes('card') || q.includes('verify')) {
      return 'You can apply for your official Digital Ogere ID Card directly on the portal at /id-card, and verify any issued card instantly on /verify-id.';
    }
    if (q.includes('market') || q.includes('buy') || q.includes('sell') || q.includes('yam')) {
      return 'Visit our Community Marketplace at /marketplace to buy and sell local produce like fresh Ogere yams, handcrafted Adire fabrics, catering services, and artisan trades!';
    }
    if (q.includes('donate') || q.includes('fund') || q.includes('sponsor') || q.includes('opay') || q.includes('support')) {
      return '🌟 Make Ogere Nigeria\'s 1st Digital Town!\nBy supporting this project, you are helping Ogere Remo pioneer history as the very first fully digitalized indigenous town in Nigeria.\n\nFunding directly supports developers, designers, project managers, cloud app hosting, and domain maintenance.\n• Bank: Opay\n• Account Number: 6101307590\n• Account Name: Hephtech Multimedia & Innovations\n• Call/WhatsApp: 09077780156\nẸ ṣéun púpọ̀ for your generous support!';
    }
    if (q.includes('scholarship') || q.includes('grant') || q.includes('student')) {
      return 'Educational empowerment grants and bursaries are available at /scholarships for secondary, undergraduate, and tech students from Ogere Remo.';
    }
    return 'Ẹ ṣéun for reaching out! You can explore all our community services across the portal, including the Monarchy, History, Marketplace, Digital ID, and News pages. If you need dedicated assistance, feel free to contact OCDA at info@ogereremo.ng.';
  };

  const send = async (text) => {
    if (!text.trim() || busy) return;
    const userMsg = { role: 'user', content: text.trim() };
    const updated = [...msgs, userMsg];
    setMsgs(updated);
    setInp('');
    setBusy(true);

    let reply = await sendChatMessages([
      { role: 'system', content: SYSTEM_PROMPT },
      ...updated,
    ]);

    if (!reply) {
      reply = getLocalAnswer(text);
    }

    setMsgs([...updated, { role: 'assistant', content: reply }]);
    setBusy(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: open ? '#7A2E0E' : '#C9963A', color: '#F5EDD8',
          fontSize: '1.5rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,.5)',
          transition: 'all .25s', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="AI Chat Assistant"
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', bottom: 'min(92px, calc(10vh + 56px))', right: 'min(24px, 4vw)', zIndex: 9999,
            width: 360, maxWidth: 'calc(100vw - 32px)', height: 480, maxHeight: 'calc(100vh - 120px)',
            background: '#1a0d06', border: '1px solid rgba(201,150,58,.3)', borderTop: '3px solid #C9963A',
            borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 8px 40px rgba(0,0,0,.6)',
          }}
        >
          <div style={{ padding: '.8rem 1rem', borderBottom: '1px solid rgba(201,150,58,.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="cinzel" style={{ fontSize: '.55rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase' }}>AI Assistant</span>
              <div style={{ fontSize: '.68rem', color: 'rgba(245,237,216,.45)' }}>Ask about Ogere Remo</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '.8rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            {msgs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '1.5rem .5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🤖</div>
                <div className="cinzel" style={{ fontSize: '.5rem', letterSpacing: '.12em', color: '#C9963A', textTransform: 'uppercase', marginBottom: '.4rem' }}>Welcome to Ogere Remo</div>
                <p style={{ fontSize: '.78rem', color: 'rgba(245,237,216,.55)', lineHeight: 1.65, marginBottom: '1rem' }}>Ask me anything about the town — history, tourism, events, emergency contacts, and more!</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem', justifyContent: 'center' }}>
                  {QUICK_ACTIONS.map((q, i) => (
                    <button key={i} onClick={() => send(q)} style={{ fontSize: '.65rem', padding: '.35rem .6rem', background: 'rgba(201,150,58,.08)', border: '1px solid rgba(201,150,58,.2)', color: 'rgba(245,237,216,.7)', cursor: 'pointer', borderRadius: 4 }}>{q}</button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '.55rem .8rem', borderRadius: 8, fontSize: '.78rem', lineHeight: 1.6,
                  background: m.role === 'user' ? 'rgba(201,150,58,.15)' : 'rgba(44,26,14,.8)',
                  color: m.role === 'user' ? '#F5EDD8' : 'rgba(245,237,216,.8)',
                  border: m.role === 'user' ? '1px solid rgba(201,150,58,.25)' : '1px solid rgba(201,150,58,.1)',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '.55rem .8rem', borderRadius: 8, background: 'rgba(44,26,14,.8)', border: '1px solid rgba(201,150,58,.1)', fontSize: '.78rem', color: 'rgba(245,237,216,.5)' }}>Thinking...</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div style={{ padding: '.6rem .8rem', borderTop: '1px solid rgba(201,150,58,.12)', display: 'flex', gap: '.5rem' }}>
            <input
              value={inp}
              onChange={e => setInp(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(inp)}
              placeholder="Ask about Ogere Remo..."
              style={{ flex: 1, padding: '.5rem .7rem', fontSize: '.78rem', background: 'rgba(44,26,14,.6)', border: '1px solid rgba(201,150,58,.2)', color: '#F5EDD8', outline: 'none', borderRadius: 4 }}
            />
            <button onClick={() => send(inp)} disabled={busy} style={{ padding: '.5rem .8rem', background: '#C9963A', border: 'none', color: '#1a0d06', fontSize: '.7rem', cursor: 'pointer', borderRadius: 4, fontWeight: 600 }}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}