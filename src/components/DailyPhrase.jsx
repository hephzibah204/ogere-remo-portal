import { useState, useEffect } from 'react';
import { sendOpenRouterMessage } from '../services/openrouter';

const PHRASES = [
  { yo: 'ÃƒÂ¡Ã‚ÂºÃ‚Â¸ kÃƒÆ’Ã‚Â¡ÃƒÆ’Ã‚Â bÃƒÂ¡Ã‚Â»Ã‚ÂÃƒÅ’Ã¢â€šÂ¬ sÃƒÆ’Ã‚Â­ Ogere Remo', en: 'Welcome to Ogere Remo' },
  { yo: 'BÃƒÆ’Ã‚Â¡wo lÃƒÆ’Ã‚Â³ ÃƒÂ¡Ã‚Â¹Ã‚Â£e rÃƒÆ’Ã‚Â­ loni?', en: 'How is it going today?' },
  { yo: 'O ÃƒÂ¡Ã‚Â¹Ã‚Â£ÃƒÆ’Ã‚Â©un pÃƒÆ’Ã‚ÂºpÃƒÂ¡Ã‚Â»Ã‚ÂÃƒÅ’Ã¢â€šÂ¬', en: 'Thank you very much' },
  { yo: 'KÃƒÆ’Ã‚Â­ lÃƒÆ’Ã‚Â³ Ãƒâ€¦Ã¢â‚¬Å¾ ÃƒÂ¡Ã‚Â¹Ã‚Â£ÃƒÂ¡Ã‚ÂºÃ‚Â¹lÃƒÂ¡Ã‚ÂºÃ‚Â¹ÃƒÅ’Ã¢â€šÂ¬?', en: 'What is happening?' },
  { yo: 'ÃƒÂ¡Ã‚ÂºÃ‚Â¸ kÃƒÆ’Ã‚Âº iÃƒÂ¡Ã‚Â¹Ã‚Â£ÃƒÂ¡Ã‚ÂºÃ‚Â¹ÃƒÅ’Ã‚Â', en: 'Well done on your work' },
  { yo: 'Alafia ni tiwa', en: 'Peace is ours' },
  { yo: 'A ÃƒÆ’Ã‚Â³ pÃƒÆ’Ã‚Â dÃƒÆ’Ã‚Â© lÃƒÂ¡Ã‚ÂºÃ‚Â¹ÃƒÅ’Ã‚ÂÃƒÂ¡Ã‚ÂºÃ‚Â¹ÃƒÅ’Ã¢â€šÂ¬kan sÃƒÆ’Ã‚Â­ i', en: 'We shall meet again' },
  { yo: 'IlÃƒÆ’Ã‚Â© wa ni yÃƒÆ’Ã‚Â¬ÃƒÆ’Ã‚Â­', en: 'This is our home' },
  { yo: 'ÃƒÂ¡Ã‚Â»Ã…â€™lÃƒÂ¡Ã‚Â»Ã‚ÂÃƒÅ’Ã‚Ârun ÃƒÆ’Ã‚Â gbÃƒÆ’Ã‚Â¨', en: 'God the farmer (Yoruba praise)' },
  { yo: 'ÃƒÆ’Ã¢â‚¬â„¢gÃƒÆ’Ã‚Â©rÃƒÆ’Ã‚Â©Ãƒâ€¦Ã¢â‚¬Å¾dÃƒÆ’Ã‚Â©Ãƒâ€¦Ã¢â‚¬Å¾dÃƒÆ’Ã‚Â© lÃƒÆ’Ã‚Â³ko', en: 'Evergreen farmlands' },
];

export default function DailyPhrase() {
  const [phrase, setPhrase] = useState(null);
  const [loading, setLoading] = useState(true);
  const day = new Date().toDateString();

  useEffect(() => {
    const cached = sessionStorage.getItem('ogere-phrase');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.day === day) {
        setPhrase(parsed);
        setLoading(false);
        return;
      }
    }
    (async () => {
      const msg = await sendOpenRouterMessage(
        'You are a Yoruba language tutor. Generate a random authentic Yoruba greeting or proverb with its English translation. Format your response exactly like this: "Yoruba: [yoruba text] | English: [english translation]". Do not use markdown. Keep it family-friendly and positive.',
        `Generate a Yoruba phrase for ${day}.`
      );
      if (msg) {
        const p = { day, yo: msg, en: '', raw: true };
        setPhrase(p);
        sessionStorage.setItem('ogere-phrase', JSON.stringify(p));
      } else {
        const fallback = PHRASES[Math.floor(Math.random() * PHRASES.length)];
        setPhrase({ day, ...fallback });
      }
      setLoading(false);
    })();
  }, [day]);

  if (loading || !phrase) return null;

  return (
    <div style={{ padding: '.6rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1rem' }}>ÃƒÂ°Ã…Â¸Ã¢â‚¬â€Ã‚Â£ÃƒÂ¯Ã‚Â¸Ã‚Â</span>
        <span className="playfair" style={{ fontSize: '.85rem', fontStyle: 'italic', color: '#F0D080' }}>
          {phrase.raw ? phrase.yo : `"${phrase.yo}"`}
        </span>
        {!phrase.raw && (
          <span style={{ fontSize: '.72rem', color: 'rgba(245,237,216,.4)' }}>ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â {phrase.en}</span>
        )}
      </div>
    </div>
  );
}